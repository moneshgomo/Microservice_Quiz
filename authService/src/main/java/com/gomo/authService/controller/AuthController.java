package com.gomo.authService.controller;


import com.gomo.authService.dto.LoginRequestDTO;
import com.gomo.authService.dto.LoginResponseDTO;
import com.gomo.authService.model.User;
import com.gomo.authService.service.AuthService;
import com.gomo.authService.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }


    @PostMapping("/sign-up")
    public ResponseEntity<String> signUp(@RequestBody User user) {
        Optional<User> registeredUser = userService.registerUser(user);

        if (registeredUser.isPresent()) {
            return ResponseEntity.ok(
                    "Welcome " + registeredUser.get().getUsername() + " 🎉🚀"
            );
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("User already exists ⚠️");
    }



    @Operation(summary = "Generate token on user login")
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO loginRequestDTO) {

        Optional<String> tokenOptional = authService.authenticate(loginRequestDTO);

        if (tokenOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = tokenOptional.get();
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @Operation(summary = "Validate Token")
    @GetMapping("/validate")
    public ResponseEntity<Void> validateToken(
            @RequestHeader("Authorization") String authHeader) {


        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return authService.validateToken(authHeader.substring(7))
                ? ResponseEntity.ok().build()
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
