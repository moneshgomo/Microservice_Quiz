package com.telusko.quizservice.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import com.quizservice.model.QuizCreateRequestWith_CODE;
import com.quizservice.dao.QuizDao;
import com.quizservice.feign.QuizInterface;
import com.quizservice.model.Quiz;
import com.quizservice.service.QuizService;
import com.quizservice.service.QuizCodeGenerator;

@ExtendWith(MockitoExtension.class)
public class QuizServiceTest {

    @InjectMocks
    private QuizService quizService;

    @Mock
    private QuizInterface quizInterface;

    @Mock
    private QuizDao quizDao;

    @Mock
    private QuizCodeGenerator generator;

    private final String QUESTION_CODE = "100602PXHUNOBPA9";
    private final String QUIZ_TITLE = "Java Quiz";
    private final String GENERATED_CODE = "quiz_123456ABCD";

    @Test
    void testCreatePrivateQuiz() {

        var request = new QuizCreateRequestWith_CODE(QUIZ_TITLE, QUESTION_CODE);
        var mockQuestions = List.of(1, 2, 3);

        when(quizInterface.getQuestionsBasedOnQuestionCode(QUESTION_CODE))
                .thenReturn(new ResponseEntity<>(mockQuestions, HttpStatus.OK));

        when(generator.generate(QUESTION_CODE))
                .thenReturn(GENERATED_CODE);

        var response = quizService.createPrivateQuiz(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(GENERATED_CODE, response.getBody());

        var captor = ArgumentCaptor.forClass(Quiz.class);
        verify(quizDao, times(1)).save(captor.capture());

        var savedQuiz = captor.getValue();

        assertEquals(QUIZ_TITLE, savedQuiz.getTitle());
        assertEquals(mockQuestions, savedQuiz.getQuestionIds());
        assertEquals(GENERATED_CODE, savedQuiz.getQuizCode());
    }
}