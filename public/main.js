function loadDoc() {
  var table = document.getElementById("myTable");
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(xhr.responseText);
      console.log(response)
      fillTable(table, response);
}
};
xhr.open("GET", "http://localhost:8080/getbooks", true);
xhr.send();
}

function loadSingle() {
    var str = document.getElementById("searchforbook").value;
    var table = document.getElementById("myTable");
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(xhr.responseText);
            console.log(response);
            fillTable(table, response);
      }
    };
    xhr.open("GET", "http://localhost:8080/getbook/"+str, true);
    xhr.send();
  }



var bookForm = document.getElementById("bookform");
bookForm.onsubmit = function (evt) {
    evt.preventDefault();

    var isbn = document.getElementById("isbn").value;
    var title = document.getElementById("title").value;
    var pages = document.getElementById("pages").value;
    var year =document.getElementById("year").value;
    var author = document.getElementById("author").value;
  
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/addbook");
    xhr.send(JSON.stringify({
        isbn: isbn,
        title: title,
        pages: pages,
        year: year,
        author: author
    }));
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            loadDoc();
      }
    };
 
};

var bookFormUpdate = document.getElementById("bookformupdate");
bookFormUpdate.onsubmit = function (evt) {
    evt.preventDefault();

    var isbn = document.getElementById("uisbn").value;
    var title = document.getElementById("utitle").value;
    var pages = document.getElementById("upages").value;
    var year =document.getElementById("uyear").value;
    var author = document.getElementById("uauthor").value;

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:8080/updatebook/"+isbn);
    xhr.send(JSON.stringify({
        isbn: isbn,
        title: title,
        pages: pages,
        year: year,
        author: author
    }));
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            loadDoc();
      }
    };
 };



function deleteBook() {
    var str = document.getElementById("deletebook").value;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            loadDoc();
      }
    };
    xhr.open("DELETE", "http://localhost:8080/deletebook/"+str, true);
    xhr.send();
  }


function fillTable(table, response){
    for(var i = table.rows.length - 1; i > 1; i--)
    {
        table.deleteRow(i);
    }
    for(var i = 0;i < response.length;i++){
        
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        
       cell1.innerHTML = response[i].isbn;
       cell2.innerHTML = response[i].title;
       cell3.innerHTML = response[i].pages;
       cell4.innerHTML = response[i].year;
       cell5.innerHTML = response[i].author;
}
}
