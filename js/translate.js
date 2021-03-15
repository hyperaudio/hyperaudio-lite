'use strict';

var translate = (function () {

  var trans = {};

  function formatSeconds(seconds) {

    //console.log("seconds = "+seconds);
    if(typeof seconds == 'number'){ 
      return new Date(seconds.toFixed(3) * 1000).toISOString().substr(11, 12);
    } else {
      console.log("warning - attempting to format the non number: "+seconds);
      return null;
    }
  }

  trans.init = function(transcriptId, playerId, maxLength, minLength) {
    var transcript = document.getElementById(transcriptId);
    var words = transcript.querySelectorAll('[data-m]');
    var data = {};
    data.segments = [];
    var segmentIndex = 0;

    function segmentMeta(speaker, start, duration, chars) {
      this.speaker = speaker;
      this.start = start;
      this.duration = duration;
      this.chars = chars;
      this.words = [];
    }

    function wordMeta(start, duration, text) {
      this.start = start;
      this.duration = duration;
      this.text = text;
    }

    var thisWordMeta;
    var thisSegmentMeta = null;

    // defaults
    var maxLineLength = 37;
    var minLineLength = 21;

    var captionsVtt = "WEBVTT\n"

    var endSentenceDelimiter = /[\.。?؟!]/g;
    var midSentenceDelimiter = /[,、–，،و:，…‥]/g;

    if (!isNaN(maxLength)) {
      maxLineLength = maxLength;
    }

    if (!isNaN(minLength)) {
      minLineLength = minLength;
    }

   var translation = "Come rendiamo le persone più consapevoli dei loro dati personali? Abbiamo due sé nel mondo in un dato momento adesso. Abbiamo il sé fisico, la nostra carne e il sangue, la nostra voce, la nostra presenza nel mondo che si estende oltre i nostri corpi ma vive in questo spazio fisico. C'è quest'altro spazio, abbiamo iniziato a chiamare cyberspazio molto tempo fa, ma è una cosa reale. È uno spazio dati. Come persone molto spesso siamo analfabeti in materia di dati. Non ci rendiamo conto dell'impatto di ciò che i dati hanno sulle nostre vite, non ci rendiamo conto di ciò che stiamo dando e perché non ci rendiamo conto dei meccanismi che ci consentiranno di dare nuovo potere a noi stessi in questo ambiente. Sicurezza e privacy, sono problemi che le persone si preoccupano di loro e dobbiamo affrontarli. Penso che sfortunatamente al momento rendiamo le persone consapevoli dei loro dati personali quando accadono cose terribili. Ci vorranno esperienze personali di caduta, una sorta di esperienza davvero orribile prima che le persone si sentano davvero costrette a essere istruite su questo. E penso che ci siano due pezzi di dati. Le persone si sentono molto a cuore, uno è l'assistenza sanitaria e l'altro è bancario. Quindi, se tocchi queste due aree, la reazione è estremamente forte perché sentono che tocca qualcosa di cui dovrebbero avere il completo controllo. Internet è creato dall'uomo e tutto ciò che metti online è recuperabile. Ci sono esperti di sicurezza di livello mondiale, ma ci sono ancora persone che rubano denaro da conti bancari. Come tecnologi, abbiamo il dovere di cercare di spiegare queste cose alle persone e cercare di farle capire, sai, trovare modi per renderle reali e avere un senso e abbiamo bisogno di più esempi e di una migliore educazione. Dobbiamo creare un dibattito più informato sui dati, in particolare sul valore dei dati. Il valore dei dati come individui e il valore dei dati aggregati. Quali sono gli svantaggi della gestione dei propri dati? In questo momento si parla più che mai di possedere i propri dati, perché ci sono così tante aziende là fuori che stanno raccogliendo dati su di noi, che non possediamo affatto, che non controlliamo affatto. Quindi, se stiamo cercando di gestire i tuoi dati, uno dei problemi è che non sai necessariamente quali dati stai fornendo ad altre persone. Quindi mancano di informazioni e mancano in alcun modo per scoprirle. Quindi in realtà voglio che sia nelle mani di agenzie che faranno del bene con ciò che possono forse utilizzare i miei dati rispetto a milioni di dati di altre persone per trovare tendenze o per trovare dettagli su di me. Quindi sì, avevamo bisogno che fosse là fuori per farlo funzionare, ed è qui che entra in gioco la tensione perché non appena accetto che sia là fuori e permetto che venga lavorato è un po 'come avere una casa festa quando avevo diciassette anni e dissi, tutti sono i benvenuti. Beh, lo erano fino a quando non è sfuggito un po 'di mano e sai con quella storia va. Penso che, penso che ci siano pochissime persone disposte a sacrificare tanto quanto mi ci vorrebbe effettivamente per non essere monitorato e sorvegliato affatto. Che tipo di aiuto è disponibile per le persone per gestire i propri dati? Dobbiamo spostare il dibattito oltre una discussione su ciò che può essere in un regno commerciale in attività nel normale ruolo domestico. Penso che dovremmo educare le persone sui dati costruendo partnership con le aziende coinvolte nella vendita di quei prodotti. Penso che abbiamo già un intermediario per gli open data in un'istituzione che è stata recentemente creata l'Open Data Institute, co-fondata da Tim Berners-Lee e Gavin Starkson, ci sono alcune persone fantastiche che hanno creato un sistema di accreditamento. Quello che succederà a lungo termine è che le persone avranno il controllo sui propri dati personali perché sapranno meglio cosa farne e gli strumenti esisteranno per farne di più, con quei dati rispetto a questi altri le aziende potrebbero. È proprio come con i personal computer. E quando mobiliti una task force mondiale di fanatici della carta ti piace fare cose. Non credo che abbiamo bisogno che le aziende tecnologiche si siedano lì e garantiscano i dati delle persone. Mi sembra un vecchio modo di fare le cose, penso che un approccio open source con accreditamento a cinque stelle da parte dell'ODI sembri un buon modo per andare avanti. La trappola in cui non cadere è la trappola della paura in questo momento, e siamo al culmine della paura grazie a Edward Snowden, grazie alla scoperta di cosa hanno fatto la NSA e gli Stati Uniti, e cosa è stato il GCHQ qui facendo. Se riesci a creare una funzione subdola in un dispositivo e decidi di non dire all'utente che decidi di infrangere un po 'la legge, sicuramente in termini di protezione dei dati, c'è un rischio reale che venga scoperto. Questo è un potere che possiamo usare per il bene o il male e probabilmente entrambi, ma noi, è presente nel mondo adesso e dobbiamo capire come usarlo.";

    //var translation = "Come rendiamo le persone più consapevoli dei loro dati personali? Doc: Abbiamo due sé nel mondo in un dato momento adesso. Abbiamo il sé fisico, la nostra carne e il sangue, la nostra voce, la nostra presenza nel mondo che si estende oltre i nostri corpi ma vive in questo spazio fisico. C'è quest'altro spazio, abbiamo iniziato a chiamare cyberspazio molto tempo fa, ma è una cosa reale. È uno spazio dati. Julian: Come persone molto spesso siamo analfabeti in materia di dati. Non ci rendiamo conto dell'impatto di ciò che i dati hanno sulle nostre vite, non ci rendiamo conto di ciò che stiamo dando e perché non ci rendiamo conto dei meccanismi che ci consentiranno di dare nuovo potere a noi stessi in questo ambiente. Adrian: Sicurezza e privacy, sono problemi che le persone si preoccupano di loro e dobbiamo affrontarli. Alexandra: Penso che sfortunatamente al momento rendiamo le persone consapevoli dei loro dati personali quando accadono cose terribili. Aleks: Ci vorranno esperienze personali di caduta, una sorta di esperienza davvero orribile prima che le persone si sentano davvero costrette a essere istruite su questo. Alexandra: E penso che ci siano due pezzi di dati. Le persone si sentono molto a cuore, uno è l'assistenza sanitaria e l'altro è bancario. Quindi, se tocchi queste due aree, la reazione è estremamente forte perché sentono che tocca qualcosa di cui dovrebbero avere il completo controllo. Doug: Internet è creato dall'uomo e tutto ciò che metti online è recuperabile. Ci sono esperti di sicurezza di livello mondiale, ma ci sono ancora persone che rubano denaro da conti bancari. Adrian: Come tecnologi, abbiamo il dovere di cercare di spiegare queste cose alle persone e cercare di farle capire, sai, trovare modi per renderle reali e avere un senso e abbiamo bisogno di più esempi e di una migliore educazione. Julian: Dobbiamo creare un dibattito più informato sui dati, in particolare sul valore dei dati. Il valore dei dati come individui e il valore dei dati aggregati. Quali sono gli svantaggi della gestione dei propri dati? Doc: In questo momento si parla più che mai di possedere i propri dati, perché ci sono così tante aziende là fuori che stanno raccogliendo dati su di noi, che non possediamo affatto, che non controlliamo affatto. Glyn: Quindi, se stiamo cercando di gestire i tuoi dati, uno dei problemi è che non sai necessariamente quali dati stai fornendo ad altre persone. Quindi mancano di informazioni e mancano in alcun modo per scoprirle. Jon: Quindi in realtà voglio che sia nelle mani di agenzie che faranno del bene con ciò che possono forse utilizzare i miei dati rispetto a milioni di dati di altre persone per trovare tendenze o per trovare dettagli su di me. Quindi sì, avevamo bisogno che fosse là fuori per farlo funzionare, ed è qui che entra in gioco la tensione perché non appena accetto che sia là fuori e permetto che venga lavorato è un po 'come avere una casa festa quando avevo diciassette anni e dissi, tutti sono i benvenuti. Beh, lo erano fino a quando non è sfuggito un po 'di mano e sai con quella storia va. Jeni: Penso che, penso che ci siano pochissime persone disposte a sacrificare tanto quanto mi ci vorrebbe effettivamente per non essere monitorato e sorvegliato affatto. Che tipo di aiuto è disponibile per le persone per gestire i propri dati? Jon: Dobbiamo spostare il dibattito oltre una discussione su ciò che può essere in un regno commerciale in attività nel normale ruolo domestico. Alexandra: Penso che dovremmo educare le persone sui dati costruendo partnership con le aziende coinvolte nella vendita di quei prodotti. Doug: Penso che abbiamo già un intermediario per gli open data in un'istituzione che è stata recentemente creata l'Open Data Institute, co-fondata da Tim Berners-Lee e Gavin Starkson, ci sono alcune persone fantastiche che hanno creato un sistema di accreditamento. Doc: Quello che succederà a lungo termine è che le persone avranno il controllo sui propri dati personali perché sapranno meglio cosa farne e gli strumenti esisteranno per farne di più, con quei dati rispetto a questi altri le aziende potrebbero. È proprio come con i personal computer. Jon: e quando mobiliti una task force mondiale di fanatici della carta ti piace fare cose. Doug: Non credo che abbiamo bisogno che le aziende tecnologiche si siedano lì e garantiscano i dati delle persone. Mi sembra un vecchio modo di fare le cose, penso che un approccio open source con accreditamento a cinque stelle da parte dell'ODI sembri un buon modo per andare avanti. Doc: La trappola in cui non cadere è la trappola della paura in questo momento, e siamo al culmine della paura grazie a Edward Snowden, grazie alla scoperta di cosa hanno fatto la NSA e gli Stati Uniti, e cosa è stato il GCHQ qui facendo. Jason: Se riesci a creare una funzione subdola in un dispositivo e decidi di non dire all'utente che decidi di infrangere un po 'la legge, sicuramente in termini di protezione dei dati, c'è un rischio reale che venga scoperto. Doc: Questo è un potere che possiamo usare per il bene o il male e probabilmente entrambi, ma noi, è presente nel mondo adesso e dobbiamo capire come usarlo.";

    
    var transSentence = "";
    var transSentences = [];
    var transSentenceIndex = 0;
    var transSentencesIndexes = [];
    
    var transWords = translation.split(' ');

    console.log(transWords);

    transWords.forEach(function(word, i) {

      var lastChar = word.replace(/\s/g, '').slice(-1);
      var penultimateChar = word.replace(/\s/g, '').slice(-2);

      transSentence += word + " ";
      transSentenceIndex += word.length + 1;

      if (lastChar.match(endSentenceDelimiter) && penultimateChar.toUpperCase() !== penultimateChar && penultimateChar.match(midSentenceDelimiter) !== true)  {
        //console.log(sentence);
        transSentences.push(transSentence);
        transSentence = "";
        transSentencesIndexes.push(transSentenceIndex);
      }
    });

    console.log(transSentences);
    console.log(transSentencesIndexes);
    
    var sentence = "";
    var sentences = [];
    var sentenceIndex = 0;
    var sentencesIndexes = [];

    words.forEach(function(word, i) {

      var lastChar = word.innerText.replace(/\s/g, '').slice(-1);
      var penultimateChar = word.innerText.replace(/\s/g, '').slice(-2);

      if (word.classList.contains("speaker") === false) {
        sentence += word.innerText;
        sentenceIndex += word.innerText.length;
      } 
      
      if (lastChar.match(endSentenceDelimiter) && penultimateChar.toUpperCase() !== penultimateChar && penultimateChar.match(midSentenceDelimiter) !== true)  {
        //console.log(sentence);
        sentences.push(sentence);
        sentence = "";
        sentencesIndexes.push(sentenceIndex);
      }
    });

    console.log(sentences);
    console.log(sentencesIndexes);

    // if different number of sentences let's try and flag the issue

    if (sentences.length !== transSentences.length) {

      var numSentences = sentences.length;
      if (transSentences.length < sentences.length) {
        numSentences = transSentences.length;
      }

      var tolerance = 0.4; // 40%

      for (var i=0; i < numSentences; i++) {
        //compare sizes

        var ratio = sentences[i].length / transSentences[i].length;
        if (ratio > (1 + tolerance) || ratio < (1 - tolerance)) {
          console.log("possible issue with sentence "+i);
        }
      }
    }

    var lastSpeaker = "";
    
    words.forEach(function(word, i) {

      if (thisSegmentMeta === null) {
        // create segment meta object
        thisSegmentMeta = new segmentMeta("", null, 0, 0, 0);
      }

      if (word.classList.contains("speaker")) {

        // checking that this is not a new segment AND a new empty segment wasn't already created
        if (thisSegmentMeta !== null && thisSegmentMeta.start !== null) { 
          //console.log("pushing...");
          //console.log(thisSegmentMeta);
          data.segments.push(thisSegmentMeta); // push the previous segment because it's a new speaker
          thisSegmentMeta = new segmentMeta("", null, 0, 0, 0);
        }

        thisSegmentMeta.speaker = word.innerText;

      } else {

        var thisStart = parseInt(word.getAttribute("data-m"))/1000;
        var thisDuration = parseInt(word.getAttribute("data-d"))/1000;

        if (isNaN(thisStart)) {
          thisStart = 0;
        }
        
        if (isNaN(thisDuration)) {
          thisDuration = 0;
        }

        var thisText = word.innerText;

        thisWordMeta = new wordMeta(thisStart, thisDuration, thisText);
        
        if (thisSegmentMeta.start === null) { 
          thisSegmentMeta.start = thisStart;
          thisSegmentMeta.duration = 0;
          thisSegmentMeta.chars = 0;
        }

        thisSegmentMeta.duration += thisDuration;
        thisSegmentMeta.chars += thisText.length;

        thisSegmentMeta.words.push(thisWordMeta);

        // remove spaces first just in case
        var lastChar = thisText.replace(/\s/g, '').slice(-1);
        if (lastChar.match(endSentenceDelimiter)) {
          data.segments.push(thisSegmentMeta);
          thisSegmentMeta = null;
        }
      }
    });

    //console.log(data.segments);

    function captionMeta(start, stop, text) {
      this.start = start;
      this.stop = stop;
      this.text = text;
    }

    var captions = [];
    var thisCaption = null;


    data.segments.map(function(segment) {

      // If the entire segment fits on a line, add it to the captions.
      if (segment.chars < maxLineLength) {

        thisCaption = new captionMeta(formatSeconds(segment.start), formatSeconds(segment.start + segment.duration), "");
        
        segment.words.forEach(function(wordMeta) {
          thisCaption.text += wordMeta.text;
        });

        thisCaption.text += "\n";
        //console.log("0. pushing because the whole segment fits on a line!");
        //console.log(thisCaption);
        captions.push(thisCaption);
        thisCaption = null;

      } else { // The number of chars in this segment is longer than our single line maximum

        var charCount = 0;
        var lineText = "";
        var firstLine = true;
        var lastOutTime;
        var lastInTime = null;
        
        segment.words.forEach(function(wordMeta, index) {

          var lastChar = wordMeta.text.replace(/\s/g, '').slice(-1);

          if (lastInTime === null) { // if it doesn't exist yet set the caption start time to the word's start time.
            lastInTime = wordMeta.start;
          }

          // Are we over the minimum length of a line and hitting a good place to split mid-sentence?
          if (charCount + wordMeta.text.length > minLineLength && lastChar.match(midSentenceDelimiter)) {

            if (firstLine === true) {

              thisCaption = new captionMeta(formatSeconds(lastInTime), formatSeconds(wordMeta.start + wordMeta.duration), "");
              thisCaption.text += lineText + wordMeta.text + "\n"; 
              
              //check for last word in segment, if it is we can push a one line caption, if not – move on to second line

              if (index + 1 >= segment.words.length) {
                //console.log("1. pushing because we're at a good place to split, we're on the first line but it's the last word of the segment.");
                //console.log(thisCaption);
                captions.push(thisCaption);
                thisCaption = null;
              } else {
                firstLine = false;
              }

            } else { // We're on the second line ... we're over the minimum chars and in a good place to split – let's push the caption

              thisCaption.stop = formatSeconds(wordMeta.start + wordMeta.duration);
              thisCaption.text += lineText + wordMeta.text + "\n";
              //console.log("2. pushing because we're on the second line and have a good place to split");
              //console.log(thisCaption);
              captions.push(thisCaption);
              thisCaption = null;
              firstLine = true;
            }

            // whether first line or not we should reset ready for a new caption
            charCount = 0;
            lineText = "";
            lastInTime = null; 

          } else { // we're not over the minimum length with a suitable splitting point

            // If we add this word are we over the maximum?
            if (charCount + wordMeta.text.length > maxLineLength) {

              if (firstLine === true) {

                if (lastOutTime === undefined) {
                  lastOutTime = wordMeta.start + wordMeta.duration;
                }

                thisCaption = new captionMeta(formatSeconds(lastInTime), formatSeconds(lastOutTime), "");
                thisCaption.text += lineText + "\n";

                // It's just the first line so we should only push a new caption if it's the very last word!

                if (index >= segment.words.length) {
                  captions.push(thisCaption);
                  thisCaption = null;
                } else {
                  firstLine = false;
                }

              } else { // We're on the second line and since we're over the maximum with the next word we should push this caption!

                thisCaption.stop = formatSeconds(lastOutTime);
                thisCaption.text += lineText + "\n";
 
                captions.push(thisCaption);

                thisCaption = null;
                firstLine = true;
              }

              // do the stuff we need to do to start a new line
              charCount = wordMeta.text.length; 
              lineText = wordMeta.text;
              lastInTime = wordMeta.start; // Why do we do this??????

            } else { // We're not over the maximum with this word, update the line length and add the word to the text

              charCount += wordMeta.text.length;
              lineText += wordMeta.text;

            }
          }

          // for every word update the lastOutTime
          lastOutTime = wordMeta.start + wordMeta.duration;
        });
        
        // we're out of words for this segment - decision time!
        if (thisCaption !== null) { // The caption had been started, time to add whatever text we have and add a stop point
          thisCaption.stop = formatSeconds(lastOutTime);
          thisCaption.text += lineText + "\n";
          //console.log("3. pushing at end of segment when new caption HAS BEEN created");
          //console.log(thisCaption);
          captions.push(thisCaption);
          thisCaption = null;
          
        } else { // caption hadn't been started yet - create one!
          if (lastInTime !== null) { 
            thisCaption = new captionMeta(formatSeconds(lastInTime), formatSeconds(lastOutTime), lineText);
            //console.log("4. pushing at end of segment when new caption has yet to be created");
            //console.log(thisCaption);
            captions.push(thisCaption);
            thisCaption = null;  
          }
        }
      }
    });

    function stringsIntersect(string1, string2) {

      console.log("checking intersection for ....");

      console.log(string1);
      console.log(string2);

      if (string1 === string2) {
        console.log("sentence is *equal* to caption");
        return 1;
      }

      if (string1.indexOf(string2) >= 0) {
        console.log("caption is larger than sentence");
        return string2.length / string1.length;
      }

      if (string2.indexOf(string1) >= 0) {
        console.log("sentence is larger than caption");
        return string2.length / string1.length;
      }

      for (var i = 1; i < string1.length; i++) {
        
        if (string2.indexOf(string1.substr(i)) >= 0) {
          console.log("partial caption in sentence");
          return string1.substr(i).length / string2.length;
        }
      }

      for (var i = 1; i < string2.length; i++) {
        if (string1.indexOf(string2.substr(i)) >= 0) {
          console.log("partial sentence in caption");
          return string2.substr(i).length / string1.length;
        }
      }

      return "";

    }

    // This split includes the character used to split in the result
    function inclusiveSplit(str, char) {
      var splitArray = str.split(char);
      var index = -1;

      splitArray.forEach(function(word, i) {
        index += word.length + 1;
        splitArray[i] += str.charAt(index);
      });
      return splitArray;
    }


    var transCaptionsVtt = "";

    var sentenceIndex = 1;
    var remainingSentence = null;
    var remainingTransSentence = null;
    captions.forEach(function(caption, c) {

      alert("caption "+c);
      var textToCheck = ""; 
      if (caption.stop !== "00:00:00.000") {

        console.log("==========================================");
        console.log("              new caption");
        console.log("==========================================");
        
        captionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + caption.text + "\n";
        console.log(caption.start + "-->" + caption.stop + "\n" + caption.text + "\n");

        var captionText = caption.text.replace(/(\r\n|\n|\r)/gm, ""); // remove line break
        textToCheck += captionText;

        var matchTolerance = 0.3;

        var thisSentence = null;
        var thisTransSentence = null;

        console.log("sentenceIndex = "+sentenceIndex);

        for (var i = sentenceIndex; i < sentences.length; i++) {

          if (remainingSentence !== null) {
            thisSentence = remainingSentence;
          } else {
            thisSentence = sentences[i];
          }

          if (remainingTransSentence !== null) {
            thisTransSentence = remainingTransSentence;
          } else {
            thisTransSentence = transSentences[i];
          }

          var intersection = stringsIntersect(captionText, thisSentence);
          console.log("------------");
          console.log("intersection");
          console.log(intersection);
          console.log("to be a match it should be > "+(1 - matchTolerance));
    
          
          if ((intersection > (1 - matchTolerance))) { // looks like a match
            console.log(captionText);
            console.log(thisSentence);
            console.log("Match!!!");
            // we found a match now let's see what part of the next sentence fits in the caption

            if (intersection === 1){ // exact match - sentence matches caption

              transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + thisTransSentence + "\n";
              
              remainingSentence = null;
              remainingTransSentence = null;
              sentenceIndex++;
              
            } else if (intersection < 1) { // sentence is smaller than caption
              // add this sentence to vtt output and figure out how much of following sentences to add
              var captionSentence = thisTransSentence;
              
              console.log("check remaining string with next sentence");
              intersection = stringsIntersect(captionText.replace(thisSentence,""), sentences[i+1]);
              console.log("next sentence intersection with text remaining in caption "+captionText.replace(thisSentence,""));
              console.log(sentences[i+1]);
              console.log("next intersection");
              console.log(intersection);

              if (intersection === 1){ // exact match - next sentence matches remains of caption
                captionSentence += transSentences[i+1];
                transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + captionSentence + "\n";
              } else if (intersection < 1) { // sentence is smaller than remaining caption
                captionSentence += transSentences[i+1];
                intersection = stringsIntersect(captionText.replace(sentence[i+1],""), sentences[i+2]);
              } else if (intersection > 1) { // sentence is larger than remaining caption
                console.log("sentence is larger than remaining caption...");
              }

              remainingSentence = null;
              remainingTransSentence = null;
              sentenceIndex++;

            } else if (intersection > 1) {// sentence is larger than caption
              
              console.log("sentence is larger than caption");
              // figure out where to split sentence
              // first see if splitting by mid-sentence delimiters give us the same number of splits in both languages
              var sentenceSplit; 
              var transSentenceSplit; 

              console.log("<== spliting sentences into smaller chunks ===>");
              sentenceSplit = inclusiveSplit(thisSentence, midSentenceDelimiter);
              transSentenceSplit = inclusiveSplit(thisTransSentence, midSentenceDelimiter);
              console.log(sentenceSplit);
              console.log(transSentenceSplit);
              console.log("<=============================================>");

 
              var testSentence = "";
              var fitSentence = "";
              var fitTransSentence = "";
              var chunkIndex = 0;

              if (sentenceSplit.length === transSentenceSplit.length) {
                // figure out where original sentence split
                console.log("same number of sentence chunks...");

                sentenceSplit.forEach(function(chunk, i) {
                  testSentence += chunk;
                  if (captionText.indexOf(testSentence) >= 0) {
                    fitSentence = testSentence;
                    fitTransSentence += transSentenceSplit[chunkIndex];
                    chunkIndex++;
                  }
                });
  
                console.log("part of sentence that fits = "+ fitSentence);
                console.log("chunk index = "+ chunkIndex);
              }

              captionSentence = "";

              if (chunkIndex > 0) {// found a matching chunk(s)

                // build up equivalent from translated sentence
                for (var i=0; i < chunkIndex; i++) {
                  captionSentence += transSentenceSplit[i];
                }
                
                console.log("testSentence = "+testSentence);
                console.log("fitSentence = "+fitSentence);
                console.log("captionText = "+captionText);

                // trim() removes whitespace from both ends of a string

                if (fitSentence.trim() === captionText.trim()) { // if the chunk matches the text exactly we can add the translated version
                  
                  transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + captionSentence + "\n";
                  remainingSentence = thisSentence.substr(fitSentence.length + 1);
                  remainingTransSentence = thisTransSentence.substr(captionSentence.length + 1);

                } else {
                  // add remaining text to matching chunk until we fit the caption text
                  // split next chunk into words

                  var thisSentenceWords = sentenceSplit[chunkIndex].trim().split(" ");
                  var thisTransSentenceWords = transSentenceSplit[chunkIndex].trim().split(" ");

                  console.log(thisSentenceWords);
                  console.log(thisTransSentenceWords);

                  var buildIndex = 0;
                
                  var testingSentence = "";
                  var buildingSentence = fitSentence + " ";
                  var buildingTransSentence = fitTransSentence + " ";

                  thisSentenceWords.forEach(function(word, i) {
                    //add spaces between words
                    if (i > 0) {
                      testingSentence += " ";
                    }
  
                    testingSentence += thisSentenceWords[i];
  
                    //console.log("testingSentence = "+testingSentence);
  
                    if (captionText.indexOf(testingSentence) >= 0) {
                      buildingSentence += thisSentenceWords[i] + " ";

                      if (typeof thisTransSentenceWords[i] !== 'undefined') {
                        buildingTransSentence += thisTransSentenceWords[i] + " ";
                      }
                      
                      //console.log("thisTransSentenceWords["+i+"] = " + thisTransSentenceWords[i]);
                      //console.log("buildingTransSentence = "+buildingTransSentence);
                    }
                  });
  
                  transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + buildingTransSentence + "\n";
  
                  console.log("constructing the remaining sentences .........");
                  console.log("thisSentence = "+thisSentence);
                  console.log("buildingSentence.length = "+buildingSentence.length);
  
                  remainingSentence = thisSentence.substr(buildingSentence.length);
                  remainingTransSentence = thisTransSentence.substr(buildingTransSentence.length);
                }

              } else { // assume that chunk is longer than caption text or chunks couldn't be matched, split into wordds

                var thisSentenceWords = thisSentence.split(" ");
                var thisTransSentenceWords = thisTransSentence.split(" ");
                // build up matching partial sentence
                
                var buildIndex = 0;
                
                var testingSentence = "";
                var buildingSentence = "";
                var buildingTransSentence = "";                

                thisSentenceWords.forEach(function(word, i) {
                  //add spaces between words
                  if (i > 0) {
                    testingSentence += " ";
                  }

                  testingSentence += thisSentenceWords[i];

                  if (captionText.indexOf(testingSentence) >= 0) {
                    buildingSentence += thisSentenceWords[i] + " ";

                    if (typeof thisTransSentenceWords[i] !== 'undefined') {
                      buildingTransSentence += thisTransSentenceWords[i] + " ";
                    }
                    //console.log("thisTransSentenceWords["+i+"] = " + thisTransSentenceWords[i]);
                    //console.log("buildingTransSentence = "+buildingTransSentence);
                  }
                });

                transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + buildingTransSentence + "\n";

                console.log("constructing the remaining sentences .........");
                console.log("thisSentence = "+thisSentence);
                console.log("buildingSentence.length = "+buildingSentence.length);

                remainingSentence = thisSentence.substr(buildingSentence.length);
                remainingTransSentence = thisTransSentence.substr(buildingTransSentence.length);
              }

              
              console.log("remainingSentence = "+remainingSentence);
              console.log("remainingTransSentence = "+remainingTransSentence);
            }
            
            console.log(transCaptionsVtt);

            console.log("================================================================");
            console.log("moving on to next caption, starting from sentence "+sentenceIndex);
            break;
          }
        }
      }
    });

    document.getElementById(playerId+'-vtt').setAttribute("src", 'data:text/vtt,'+encodeURIComponent(captionsVtt));
    console.log(captionsVtt);

  }

  return trans;

});