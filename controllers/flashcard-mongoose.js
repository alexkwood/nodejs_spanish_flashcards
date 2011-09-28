/** attempt to use Mongoose for model. copied from app.js, not yet working. **/

// var db = mongoose.connect({
//   host: 'localhost',
//   database: 'flashcards',
//   port: 27017,
//   options: {}
// });
// 
// var Schema = mongoose.Schema, 
//     ObjectId = Schema.ObjectId  // neces?
//     ;
// 
// var FlashcardSchema = new Schema({
//     word_es   : String
//   , word_en   : String
//   , type      : { type: String }    // special case
//   , created   : Date
// });
// 
// var FlashcardModel = new mongoose.model('Flashcard', FlashcardSchema);
// 
// var card = new FlashcardModel();
// card.my.word_es = 'esta noche';
// card.my.word_en = 'tonight';
// card.my.type = 'n';
// // card.my.created = new SchemaDate();    // ???
// card.save(function(err){
//   res.write("ERROR!!!\n");
//   res.write(util.inspect(err));
// });
