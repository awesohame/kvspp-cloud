package com.kvsppdemo.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.beans.factory.annotation.Autowired;
import com.kvsppdemo.demo.service.UserService;

@Configuration
public class SecurityConfig {
    @Autowired
    private UserService userService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("SecurityConfig: filterChain loaded");
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/ping").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(userService)
                                .oidcUserService(oidcUserRequest -> {
                                    System.out.println("SecurityConfig: OIDC user service called");
                                    OidcUserService delegate = new OidcUserService();
                                    OidcUser oidcUser = delegate.loadUser(oidcUserRequest);
                                    userService.persistUserFromAttributes(oidcUser.getAttributes());
                                    return oidcUser;
                                })
                        )
                );
        return http.build();
    }
}
