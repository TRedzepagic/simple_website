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
      if(str.length==0)
      {
          alert("Please input an ISBN!");
      }else{
          var table = document.getElementById("myTable");
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                  var response = JSON.parse(xhr.responseText);
                  console.log(response);
                  fillTable(table, response);
            }
            if (this.readyState==4 && this.status == 404){
                alert ("Book doesn't exist");
            }
          };
          xhr.open("GET", "http://localhost:8080/getbook/"+str, true);
          xhr.send();
        }
      }
  
  
  
  
  var bookForm = document.getElementById("bookform");
  bookForm.onsubmit = function (evt) {
      evt.preventDefault();
  
      var isbn = document.getElementById("isbn").value;
      var title = document.getElementById("title").value;
      var pages = document.getElementById("pages").value;
      var year =document.getElementById("year").value;
      var author = document.getElementById("author").value;
    
      if(isbn.length==0 || title.length==0 || pages.length==0 || year.length==0 || author.length==0)
      {
          alert("One or more fields are empty!");
      }else{
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
              alert("Request successful");
        }
        if (this.readyState==4 && this.status == 500){
            loadDoc();
            alert("Something went wrong. Check if you're trying to add a duplicate entry")
        }
      };
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
  
      if(isbn.length==0 || title.length==0 || pages.length==0 || year.length==0 || author.length==0)
      {
          alert("One or more fields are empty!");
      }else{
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
                  alert("Request successful");
                }
                if (this.readyState==4 && this.status ==404){
                    alert("Book doesn't exist")
                }
          };
      }
   };
  
  
  
  function deleteBook() {
      var str = document.getElementById("deletebook").value;
      if (str.length==0){
          alert("Please input an ISBN!");
      }else{
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                  loadDoc();
                  alert("Request successful");
            }
            if(this.readyState==4 && this.status==404){
                alert("Book doesn't exist")
            }
          };
          xhr.open("DELETE", "http://localhost:8080/deletebook/"+str, true);
          xhr.send();
        }
      
      }
  
  
  function fillTable(table, response){
      for(var i = table.rows.length - 1; i > 1; --i)
      {
          table.deleteRow(i);
      }

      response.forEach(el => {
      const tableRow = document.createElement("tr");

      const tableISBN = document.createElement("td");
      tableISBN.style.textAlign='center';
      const tableTitle = document.createElement("td");
      tableTitle.style.textAlign='center';
      const tablePages = document.createElement("td");
      tablePages.style.textAlign='center';
      const tableYear = document.createElement("td");
      tableYear.style.textAlign='center';
      const tableAuthor = document.createElement("td");
      tableAuthor.style.textAlign='center';

      tableISBN.textContent = el.isbn;
      tableTitle.textContent =el.title;
      tablePages.textContent=el.pages;
      tableYear.textContent=el.year;
      tableAuthor.textContent=el.author;

      tableRow.appendChild(tableISBN);
      tableRow.appendChild(tableTitle);
      tableRow.appendChild(tablePages);
      tableRow.appendChild(tableYear);
      tableRow.appendChild(tableAuthor);

      table.appendChild(tableRow)})
}

  
  