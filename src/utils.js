const Utils = {
  filter: function (str) {
      var arr = str.split(".");
      return arr[arr.length - 1];
  },
  sanitize: function (obj, name) {
      var o = {
          parent: name
      }

      var content = {
          content: JSON.parse(obj)
      }

      return Object.assign(o, content);
  },
  defaultConfig:
    {
      frequency: "daily",
      last_recorded: "NA",
      apis :[
        {
          "url": "http://www.omdbapi.com/?t=frozen&y=&plot=short&r=json",
          "name": "Frozen"
        },
        {
          "url": "http://www.omdbapi.com/?t=terminator&y=&plot=short&r=json",
          "name": "Terminator"
        }]
    }
}

module.exports = Utils;
