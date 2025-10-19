package com.kvspp.cloud.server.security;

import com.kvspp.cloud.server.model.User;
import com.kvspp.cloud.server.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Value("${client.url}")
    private String clientUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Extract user details from OAuth2 user
        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Find user in database
        Optional<User> userOptional = userRepository.findByGoogleId(googleId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Generate JWT token
            String token = jwtUtil.generateToken(
                user.getId().toString(),
                user.getEmail(),
                user.getName()
            );

            // Redirect to frontend with token
            String redirectUrl = clientUrl + "/auth/callback?token=" + token;

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } else {
            // User not found - should not happen if UserService persists correctly
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not found");
        }
    }
}

