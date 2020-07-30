const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
// const { response } = require('../app');
const bodyParser = require('body-parser');

const languageRouter = express.Router();

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      );

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        });

      req.language = language;
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      );

      res.json({
        language: req.language,
        words,
      });
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const head = await LanguageService.getWord(
        req.app.get('db'),
        req.language.head
      )
      res.json({
        nextWord: head.original,
        totalScore: req.language.total_score,
        wordCorrectCount: head.correct_count,
        wordIncorrectCount: head.incorrect_count
      });
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .post('/guess', bodyParser.json(), async (req, res, next) => {
    try {
      if (!req.body.guess) {
        res.status(400).json({ error: `Missing 'guess' in request body` });
      } else {

        const wordList = await LanguageService.getLanguageWords(
          req.app.get('db'),
          req.language.id
        );
        let word = await LanguageService.getWord(
          req.app.get('db'),
          req.language.head
        );
        const guess = req.body.guess;
        if (guess.toLowerCase().trim() === word.translation.toLowerCase()) {
          await LanguageService.correctUpdate(
            req.app.get('db'),
            word,
            wordList,
            req.language
          );
          const newWord = await LanguageService.getWord(req.app.get('db')
          , word.next);
          res.json({
            answer: word.translation,
            isCorrect: true,
            nextWord: newWord.original,
            totalScore: req.language.total_score,
            wordCorrectCount: newWord.correct_count,
            wordIncorrectCount: newWord.incorrect_count
          });
        } else {
          await LanguageService.incorrectUpdate(
            req.app.get('db'),
            word,
            req.language
          );
          const newWord = await LanguageService.getWord(req.app.get('db'), word.next);
          res.json({
            answer: word.translation,
            isCorrect: false,
            nextWord: newWord.original,
            totalScore: req.language.total_score,
            wordCorrectCount: newWord.correct_count,
            wordIncorrectCount: newWord.incorrect_count
          });
        }
      };
      next();
    } catch (error) {
      next(error);
    }
  });

module.exports = languageRouter;
