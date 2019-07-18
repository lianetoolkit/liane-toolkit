Picker.route("/subscription/people", (params, req, res, next) => {
  console.log(req);
  if(req.method !== "POST") {
    res.statusCode = 405;
    res.statusMessage = "Method not allowed";
    res.end("405 Method not allowed");
    return;
  }
  res.end("teste");
});
