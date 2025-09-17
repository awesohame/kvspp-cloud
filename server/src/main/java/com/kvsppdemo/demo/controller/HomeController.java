package com.kvsppdemo.demo.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @GetMapping("/")
    public Object home(@AuthenticationPrincipal OAuth2User principal) {
        System.out.println("Homecontroller called" + principal);
        if (principal == null) return "Not logged in";
        return principal.getAttributes();
    }
}
