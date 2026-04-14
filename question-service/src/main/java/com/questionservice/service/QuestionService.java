package com.questionservice.service;


import com.questionservice.dao.QuestionDao;
import com.questionservice.model.Question;
import com.questionservice.model.QuestionWrapper;
import com.questionservice.model.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
public class QuestionService {
    @Autowired
    QuestionDao questionDao;

   
            private final QuestionCodeGenerator generator;

            public QuestionService(QuestionDao questionDao, QuestionCodeGenerator generator) {
                this.questionDao = questionDao;
                this.generator = generator;
            }



    public ResponseEntity<List<Question>> getAllQuestions() {
        return new ResponseEntity<>(questionDao.findQuestionsWithNullCode(), HttpStatus.OK);
    }

    public ResponseEntity<List<Question>> getQuestionsByCategory(String category) {
        return new ResponseEntity<>(questionDao.findByCategory(category),HttpStatus.OK);

    }

    public ResponseEntity<String> addQuestion(List<Question> questions) {

        String generatedCode = generator.generate();
    
        for (Question question : questions) {
            question.setQuestion_code(generatedCode);
        }
    
        questionDao.saveAll(questions);
    
        return new ResponseEntity<>(generatedCode, HttpStatus.CREATED);
    }


    
    public ResponseEntity<List<Integer>> getQuestionsForQuiz(String categoryName, Integer numQuestions) {
        List<Integer> questions = questionDao.findRandomQuestionsByCategory(categoryName, numQuestions);
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }

    public ResponseEntity<List<QuestionWrapper>> getQuestionsFromId(List<Integer> questionIds) {
        List<QuestionWrapper> wrappers = new ArrayList<>();
        List<Question> questions = new ArrayList<>();

        for(Integer id : questionIds){
            questions.add(questionDao.findById(id).get());
        }

        for(Question question : questions){
            QuestionWrapper wrapper = new QuestionWrapper();
            wrapper.setId(question.getId());
            wrapper.setQuestionTitle(question.getQuestionTitle());
            wrapper.setOption1(question.getOption1());
            wrapper.setOption2(question.getOption2());
            wrapper.setOption3(question.getOption3());
            wrapper.setOption4(question.getOption4());
            wrappers.add(wrapper);
        }

        return new ResponseEntity<>(wrappers, HttpStatus.OK);
    }

    public ResponseEntity<Integer> getScore(List<Response> responseList) {


        int right = 0;

        for(Response response : responseList){
            Question question = questionDao.findById(response.getId()).get();
            if(response.getResponse().equals(question.getRightAnswer()))
                right++;
        }
        return new ResponseEntity<>(right, HttpStatus.OK);
    }


    public ResponseEntity<List<String>> getCategories() {
        return new ResponseEntity<>(questionDao.getCategories(), HttpStatus.OK);
    }

    public List<Integer> getQuestionBasedOnQuestion_Code(String questionCode) {
        return questionDao.findQuestionIdsByCode(questionCode);
    }


}
