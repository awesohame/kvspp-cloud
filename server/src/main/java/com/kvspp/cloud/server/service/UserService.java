package com.kvspp.cloud.server.service;

import com.kvspp.cloud.server.model.User;
import com.kvspp.cloud.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        System.out.println("UserService: loadUser called");
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String googleId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        System.out.println("UserService: googleId=" + googleId + ", email=" + email + ", name=" + name);

        Optional<User> userOpt = userRepository.findByGoogleId(googleId);
        User user = userOpt.orElseGet(User::new);
        user.setGoogleId(googleId);
        user.setEmail(email);
        user.setName(name);
        user.setProfilePicture(picture);
        System.out.println("UserService: Saving user " + user.getEmail());
        userRepository.save(user);

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "sub"
        );
    }

    public void persistUserFromAttributes(Map<String, Object> attributes) {
        String googleId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        System.out.println("UserService: persistUserFromAttributes called");
        System.out.println("UserService: googleId=" + googleId + ", email=" + email + ", name=" + name);
        Optional<User> userOpt = userRepository.findByGoogleId(googleId);
        User user = userOpt.orElseGet(User::new);
        user.setGoogleId(googleId);
        user.setEmail(email);
        user.setName(name);
        user.setProfilePicture(picture);
        System.out.println("UserService: Saving user " + user.getEmail());
        userRepository.save(user);
    }
}
