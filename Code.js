/**
 * This sheet adds an option to the top-bar of google sheets to fill an NxM range of the
 * sheet using OpenAI's GPT-3 Language model.
 */

var API_KEY = "[API_KEY_GOES_HERE]";

var preface = "I am a highly intelligent question answering bot. If you ask me a question that is rooted in truth, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with 'Unknown'.\
\
Q: What is human life expectancy in the United States?\
A: 78 years.\
\
Q: Who was president of the United States in 1955?\
A: Dwight D. Eisenhower.\
\
Q: Which party did he belong to?\
A: He belonged to the Republican Party.\
\
Q: What is the square root of banana?\
A: Unknown\
\
Q: How does a telescope work?\
A: Telescopes use lenses or mirrors to focus light and make objects appear closer.\
\
Q: Where were the 1992 Olympics held?\
A: Barcelona, Spain.\
\
Q: How many squigs are in a bonk?\
A: Unknown\
\
Q: What is the revenue of General Motors?\
A: $150.8 billion.\
\
Q: What is the market cap of 3M?\
A: $93.8 billion.\
\
"

var NUM_TOKENS = 15;

function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();

  var menuItems = [
    {name: 'Fill with GPT-3', functionName: 'gpt3fill'},
  ];

  spreadsheet.addMenu('GPT3', menuItems);
}

function _callAPI(prompt) {
  var data = {
    'prompt': prompt,
    'max_tokens': NUM_TOKENS,
    'temperature': 0,
  };

  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data),
    'headers': {
      Authorization: 'Bearer ' + API_KEY,
    },
  };

  response = UrlFetchApp.fetch(
    'https://api.openai.com/v1/engines/davinci/completions',
    options,
  );

  return JSON.parse(response.getContentText())['choices'][0]['text']
}

function _parse_response(response) {
  var parsed_fill = response.slice(3, response.indexOf('Q: '));

  if (parsed_fill.charAt(parsed_fill.length - 1) == '.') {
    parsed_fill = parsed_fill.slice(0, -1);
  }

  return parsed_fill;
}

function get_x_of_y(x, y) {
  var prompt = preface + "Q: What is the " + x + " of " + y + "?"

  var response = _callAPI(prompt);

  var parsed_response = _parse_response(response);

  return parsed_response;
}


function gpt3fill() {
  /*
  Highlight a nxm range where the leftmost column contains names of public companies.
  The header row of a column identifies properties of those companies.
  Fill in the values.
  */
  var spreadsheet = SpreadsheetApp.getActive();
  var range = spreadsheet.getActiveRange();
  var num_rows = range.getNumRows();
  var num_cols = range.getNumColumns();

  for (var x=2; x<num_cols + 1; x++) {
    property_name = range.getCell(1, x).getValue();

    for (var i=2; i<num_rows + 1; i++) {
      entity_name = range.getCell(i,1).getValue();
      fill_cell = range.getCell(i, x);

      result = get_x_of_y(property_name, entity_name);

      fill_cell.setValue([result]);
    }
  }
}

