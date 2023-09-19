import "../style.scss";

import TodoList from "./components/todoList/TodoList";

new TodoList({
  url: "https://64ef298b219b3e2873c40b2c.mockapi.io",
  el: "#app"
});
