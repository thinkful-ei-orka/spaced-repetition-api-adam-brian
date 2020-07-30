const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id });
  },

  getWord(db, word_id) {
    return db
      .from('word')
      .select(
        'id',
        'original',
        'translation',
        'memory_value',
        'correct_count',
        'incorrect_count',
        'language_id',
        'next'
      )
      .where('id', word_id)
      .first();
  },

  updateLanguage(db, next, language, totalMod) {
    return db
      .from('language')
      .update({
        head: next,
        total_score: language.total_score += totalMod
      })
      .where('language.user_id', language.user_id);
  },

  updateNext(db, nextWord, currentWord) {
    return db
      .from('word')
      .update({ next: currentWord.id })
      .where('id', nextWord.id);
  },

  async correctUpdate(db, word, wordList, language) {
    await this.updateLanguage(db, word.next, language, 1);
    const newMemory = word.memory_value * 2;
    let nextWord = await this.getWord(db, word.id + newMemory);
    if (!nextWord || nextWord.id > Math.max(...wordList.map(word => word.id !== null ? word.id : 0))) {
      nextWord = await this.getWord(db, wordList.find(word => word.next === null).id);
    }
    await this.updateNext(db, nextWord, word);
    return db
      .from('word')
      .update({
        memory_value: newMemory,
        next: nextWord.next,
        correct_count: word.correct_count + 1
      })
      .where('id', word.id);
  },

  async incorrectUpdate(db, word, language) {
    await this.updateLanguage(db, word.next, language, 0);
    const newMemory = 1;
    const nextWord = await this.getWord(db, word.id + newMemory);
    await this.updateNext(db, nextWord, word);
    return db
      .from('word')
      .update({
        memory_value: newMemory,
        next: nextWord.next,
        incorrect_count: word.incorrect_count + 1
      })
      .where('id', word.id);
  }
};

module.exports = LanguageService;
