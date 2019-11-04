var settings = {
  "async": true,
  "crossDomain": true,
  "url": "http://csccap.paulistano.org.br/tas/api/incidents/number/Pedido%201901-002914",
  "method": "GET",
  "headers": {
    "Authorization": "TOKEN id=\"4d3fd572-8641-4a1f-9549-99753e34d421\"",
    "Accept": "application/json",
    "cache-control": "no-cache",
    "Postman-Token": "f674bf39-28a3-4729-bd55-8ab5468909cc"
  }
}

$.ajax(settings).done(function (response) {
  console.log(response);
});