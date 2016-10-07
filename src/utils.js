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
  }
}

module.exports = Utils;
