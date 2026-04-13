package com.telusko.quizservice.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
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

@ExtendWith(MockitoExtension.class)
public class QuizServiceTest {

    @InjectMocks
    private QuizService quizService;

    @Mock
    private QuizInterface quizInterface;

    @Mock
    private QuizDao quizDao;

    String QUESTION_CODE = "100602PXHUNOBPA9";
    String QUIZ_TITLE ="Java Quiz";
    
    QuizCreateRequestWith_CODE request =  new QuizCreateRequestWith_CODE(QUIZ_TITLE,QUESTION_CODE);

    @Test
    void testCreatePrivateQuiz() {

        List<Integer> mockQuestionsIDList = List.of(1, 2, 3);

        when(quizInterface.getQuestionsBasedOnQuestionCode(QUESTION_CODE))
        .thenReturn(new ResponseEntity<>(mockQuestionsIDList, HttpStatus.OK)); 

        ResponseEntity<String> response =  quizService.createPrivateQuiz(request);
        
        assertEquals(HttpStatus.CREATED, response.getStatusCode()); 
        assertNotNull(response.getBody());

        verify(quizDao, times(1)).save(any(Quiz.class));
    }
}