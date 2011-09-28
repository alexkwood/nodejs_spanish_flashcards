# A log of issues encountered as I build this app.

* trouble w/ 'block' and nested templates. Seem to have figured out.

* Can the same URL handle POST and GET or do they have to be separate URLs?
  - yes, just get() and post() the same path.
* but what's the best way to handle the same form with or without POSTed data?

* use Step for logic flow? https://github.com/creationix/step

* forms module breaks when bodyParser is used.

* put model class in models/word.js, but it doesn't have access to libraries called in app.js

* 'this' var in object gets lost/unbound as callbacks get deeper

* forms plugin -- after submitted, want to show form again but EMPTY; shows submitted values. how to reset?

* how to catch un-handled paths w/o crash?