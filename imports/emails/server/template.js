export const template = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
     %STYLE%
    </style>
  </head>
  <body
    style="width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;"
  >
    %CONTENT%
  </body>
</html>
`;

export const style = `
@media only screen and (max-width: 650px) {
  .title-heading {
    font-size: 18px !important;
  }
}
h2,
p {
  line-height: 1.5;
}
p {
  margin: 0 0 15px;
}
`;

export default { template, style };
