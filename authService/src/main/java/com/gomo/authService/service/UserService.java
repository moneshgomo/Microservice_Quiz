package com.gomo.authService.service;

import com.gomo.authService.exceptions.EmailAlreadyExistsException;
import com.gomo.authService.model.Role;
import com.gomo.authService.model.User;
import com.gomo.authService.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private static final Role DEFAULT_ROLE = Role.USER;
    private static final String ROLE_DECIDER = "ADMIN_DEMO_DATA_CHANGE_SOON";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public Optional<User> registerUser(User user) {
        Optional<User> existingUser = findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw  new EmailAlreadyExistsException( "A patient with this email " + "already exists" + user.getEmail());
        }

        User savedUser = createAndSaveUser(user);
        return Optional.of(savedUser);
    }

    private User createAndSaveUser(User user) {
        user.setRole(determineRole(user.getPassword()));

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    private Role determineRole(String password) {
        if (isAdminPassword(password)) {
            return Role.ADMIN;
        }
        return DEFAULT_ROLE;
    }

    private boolean isAdminPassword(String password) {
        if (password == null) return false;
        return password.contains(ROLE_DECIDER) ;
    }
}
