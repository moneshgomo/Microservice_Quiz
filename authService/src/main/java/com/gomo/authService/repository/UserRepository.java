package com.gomo.authService.repository;

import java.util.Optional;

import com.gomo.authService.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}