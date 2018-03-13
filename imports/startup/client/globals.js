// Privacy policy
(function(w, d) {
  var loader = function() {
    setTimeout(function() {
      var s = d.createElement("script"),
      tag = d.getElementsByTagName("script")[0];
      s.src = "//cdn.iubenda.com/iubenda.js";
      tag.parentNode.insertBefore(s, tag);
    }, 1000);
  };
  if (w.addEventListener) {
    w.addEventListener("load", loader, false);
  } else if (w.attachEvent) {
    w.attachEvent("onload", loader);
  } else {
    w.onload = loader;
  }
})(window, document);
