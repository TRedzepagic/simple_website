package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"gopkg.in/yaml.v2"
)

type book struct {
	ISBN       string `json:"isbn"`
	Title      string `json:"title"`
	Pages      string `json:"pages"`
	Year       string `json:"year"`
	AuthorName string `json:"author"`
}

type databaseHandler struct {
	db *sql.DB
}

type dbconfig struct {
	DbDriver string `yaml:"dbdriver"`
	DbUser   string `yaml:"dbuser"`
	DbPass   string `yaml:"dbpass"`
	DbName   string `yaml:"dbname"`
}

func createDataBaseHandler() *databaseHandler {
	path := os.Getenv("DBCONF")
	// Path check
	// fmt.Println(path)

	data, err := ioutil.ReadFile(path)

	if err != nil {
		fmt.Println("error opening configuration", err.Error())
	}

	var databaseConfig dbconfig
	err = yaml.Unmarshal(data, &databaseConfig)
	if err != nil {
		fmt.Println("unmarshalling error: ", err.Error())
	}

	// Check
	// fmt.Println(databaseConfig.DbDriver)
	// fmt.Println(databaseConfig.DbUser)
	// fmt.Println(databaseConfig.DbPass)
	// fmt.Println(databaseConfig.DbName)

	var dbHandler databaseHandler
	dbDriver := databaseConfig.DbDriver
	dbUser := databaseConfig.DbUser
	dbPass := databaseConfig.DbPass
	dbName := databaseConfig.DbName

	db, err := sql.Open(dbDriver, dbUser+":"+dbPass+"@/"+dbName)
	if err != nil {
		log.Print(err.Error())
		panic(err.Error())
	}
	dbHandler.db = db

	return &dbHandler
}

func (databaseHandler *databaseHandler) getBooks(w http.ResponseWriter, r *http.Request) {
	selectFromDB, err := databaseHandler.db.Query("SELECT * FROM BOOKS ORDER BY isbn ASC")
	if err != nil {
		log.Print(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	oneBook := book{}
	var bookSlice []book
	for selectFromDB.Next() {
		err = selectFromDB.Scan(&oneBook.ISBN, &oneBook.Title, &oneBook.Pages, &oneBook.Year, &oneBook.AuthorName)
		if err != nil {
			log.Print(err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}
		bookSlice = append(bookSlice, oneBook)
	}

	json.NewEncoder(w).Encode(bookSlice)
}

func (databaseHandler *databaseHandler) getBook(w http.ResponseWriter, r *http.Request) {
	param := mux.Vars(r)

	selectFromTBL := databaseHandler.db.QueryRow("SELECT * FROM BOOKS WHERE isbn=? ORDER BY isbn ASC", param["isbn"])

	oneBook := book{}
	var bookSlice []book
	err := selectFromTBL.Scan(&oneBook.ISBN, &oneBook.Title, &oneBook.Pages, &oneBook.Year, &oneBook.AuthorName)
	if err != nil {
		log.Print(err)
		http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)

	} else {
		bookSlice = append(bookSlice, oneBook)
		json.NewEncoder(w).Encode(bookSlice)
	}

}

func (databaseHandler *databaseHandler) addBook(w http.ResponseWriter, r *http.Request) {
	var newBook book
	json.NewDecoder(r.Body).Decode(&newBook)

	fmt.Println(newBook)

	if len(strings.TrimSpace(newBook.ISBN)) == 0 || len(strings.TrimSpace(newBook.Title)) == 0 || len(strings.TrimSpace(newBook.Pages)) == 0 || len(strings.TrimSpace(newBook.Year)) == 0 || len(strings.TrimSpace(newBook.AuthorName)) == 0 {
		log.Print("Empty fields not allowed, ignoring..")
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	stmt, err := databaseHandler.db.Prepare("INSERT INTO BOOKS(ISBN, TITLE, PAGES, YEAR, AUTHORNAME) VALUES(?, ?, ?, ?, ?)")
	if err != nil {
		log.Print(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)

	}

	_, err = stmt.Exec(newBook.ISBN, newBook.Title, newBook.Pages, newBook.Year, newBook.AuthorName)
	if err != nil {
		log.Print(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

}

func (databaseHandler *databaseHandler) delBook(w http.ResponseWriter, r *http.Request) {
	param := mux.Vars(r)

	_, err := databaseHandler.db.Query("DELETE FROM BOOKS WHERE isbn=?", param["isbn"])
	if err != nil {
		log.Print(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

}

func (databaseHandler *databaseHandler) updateBook(w http.ResponseWriter, r *http.Request) {
	param := mux.Vars(r)
	var newBook book
	json.NewDecoder(r.Body).Decode(&newBook)
	fmt.Println(newBook)

	if len(strings.TrimSpace(newBook.ISBN)) == 0 || len(strings.TrimSpace(newBook.Title)) == 0 || len(strings.TrimSpace(newBook.Pages)) == 0 || len(strings.TrimSpace(newBook.Year)) == 0 || len(strings.TrimSpace(newBook.AuthorName)) == 0 {
		log.Print("Empty fields not allowed, ignoring..")
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	stmt, err := databaseHandler.db.Prepare("UPDATE BOOKS SET ISBN=?,TITLE=?,PAGES=?,YEAR=?,AUTHORNAME=? WHERE isbn=?")
	if err != nil {
		log.Print(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	_, err = stmt.Exec(newBook.ISBN, newBook.Title, newBook.Pages, newBook.Year, newBook.AuthorName, param["isbn"])
	if err != nil {
		log.Print(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

}

func middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		if r.Method == "OPTIONS" {
			return
		}
		log.Println(r.Method)
		log.Println(r.RequestURI)
		next.ServeHTTP(w, r)
	})
}

func main() {

	dbHandler := createDataBaseHandler()
	defer dbHandler.db.Close()

	r := mux.NewRouter()

	r.HandleFunc("/getbooks", dbHandler.getBooks)
	r.HandleFunc("/getbook/{isbn}", dbHandler.getBook)
	r.HandleFunc("/addbook", dbHandler.addBook)
	r.HandleFunc("/deletebook/{isbn}", dbHandler.delBook)
	r.HandleFunc("/updatebook/{isbn}", dbHandler.updateBook)
	r.Use(middleware)

	fmt.Println("Server started..")
	log.Fatal(http.ListenAndServe(":8080", r))
}
