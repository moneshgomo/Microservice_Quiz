package com.quizservice.dao;


import com.quizservice.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizDao extends JpaRepository<Quiz,Integer> {


    @Query(value = "SELECT question_ids FROM quiz WHERE quiz_code = :quizCode", nativeQuery = true)
    List<Integer> findByQuizCode(@Param("quizCode") String quizCode);


    @Query(value = "SELECT * FROM quiz WHERE quiz_code = :quizCode", nativeQuery = true)
    Optional<Quiz> findByQuizByCode(@Param("quizCode") String quizCode);

    @Query(value = "SELECT * FROM quiz WHERE quiz_code IS NULL", nativeQuery = true)
    List<Quiz> findQuizzesWithNullCode();


    @Query(value = """
    SELECT qqi.question_ids
    FROM quiz q
    JOIN quiz_question_ids qqi
    ON q.id = qqi.quiz_id
    WHERE q.quiz_code = :quizCode
    """, nativeQuery = true)
    List<Integer> findQuestionIdsByQuizCode(@Param("quizCode") String quizCode);


}
