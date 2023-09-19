import getTemplate from './template.js';
import './styles.scss';
import DB from "../../DB.js";
import Todo from "../todo/Todo.js";

export default class TodoList {
  // Constructeur de la classe TodoList
  constructor(data) {
    // Configuration de l'URL de l'API
    DB.setApiURL(data.url);
    // Sélection de l'élément du DOM où la liste de todos sera affichée
    this.el = document.querySelector(data.el);
    this.todo_list = null;
    this.new_todo = null;
    this.todos = [];
    // Chargement des todos depuis la base de données
    this.loadTodos();
    // Ajout d'un écouteur d'événement pour mettre à jour le compteur
    document.addEventListener('updateCounter', () => this.renderTodoCount());
  }
  // Méthode pour charger les todos depuis la base de données
  async loadTodos() {
    const todos = await DB.findAll();
    this.todos = todos.map(todo => {
      const todoInstance = new Todo(todo);
      todoInstance.todoListInstance = this;
      return todoInstance;
    });
    this.render();
  }

  // async loadTodos() {
  //   const todos = await DB.findAll();
  //   todos.forEach((todo) => {
  //     const todoInstance = new Todo(todo);
  //     todoInstance.todoListInstance = this;
  //     this.todos.push(todoInstance);
  //   });
  //   this.render();
  // }

  // Méthode pour afficher les todos
  render() {
    this.el.innerHTML = getTemplate(this);
    this.todo_list = this.el.querySelector(".todo-list");
    this.todos.forEach((todo) => {
      todo.render(this.todo_list);
    });
    this.activateElements();
    this.renderTodoCount();
  }

  // Méthode pour mettre à jour le compteur de todos
  renderTodoCount() {
    this.el.querySelector(".todo-count strong").innerText = 
      this.todos.filter((todo) => !todo.completed).length;
  }

  // Méthode pour activer les éléments interactifs
  activateElements() {
    this.new_todo = this.el.querySelector('.new-todo');
    this.clearCompletedButton = this.el.querySelector('.clear-completed');
    this.filterAll = this.el.querySelector('.filters a[href="#/"]');
    this.filterActive = this.el.querySelector('.filters a[href="#/active"]');
    this.filterCompleted = this.el.querySelector('.filters a[href="#/completed"]');

    // Capture d'évenement pour l ajout d un todo
    this.new_todo.onkeyup = (e) => {
      if(e.code === "Enter" && this.new_todo.value != '') {
        this.addTodo();
      }
    };

     // Capture d'évenement pour la supression de toute les taches completed
    this.clearCompletedButton.addEventListener('click', this.clearCompletedTodos.bind(this));

    // activation des filtres
    this.filterAll.addEventListener('click', () => this.filterTodos('all'));
    this.filterActive.addEventListener('click', () => this.filterTodos('active'));
    this.filterCompleted.addEventListener('click', () => this.filterTodos('completed'));
  }

  // Méthode pour ajouter un nouveau todo
  async addTodo() {
    const todoData = await DB.addOne({
      content: this.new_todo.value,
      completed: false
    });
    const newTodoInstance = new Todo(todoData);
    newTodoInstance.todoListInstance = this;
    this.todos.push(newTodoInstance);
    newTodoInstance.render(this.todo_list);
    this.new_todo.value = "";
    this.renderTodoCount();
  }

  //Méthode pour supprimer tous les todo completed
  async clearCompletedTodos() {
    const completedTodos = this.todos.filter(todo => todo.completed);
    for (let todo of completedTodos) {
        await DB.delete(todo.id); // Supprimez le todo de la base de données
        const index = this.todos.indexOf(todo);
        if (index > -1) {
            this.todos.splice(index, 1); // Supprimez le todo de l'array todos
        }
    }
    this.render(); // Re-rendez la liste pour refléter les changements
    this.renderTodoCount()
}

filterTodos(filterType) {
  const allTodos = this.el.querySelectorAll('.todo-list li');
  const filters = this.el.querySelectorAll('.filters a');
  filters.forEach(filter => filter.classList.remove('selected'));

  allTodos.forEach(todo => {
      const isCompleted = todo.classList.contains('completed');
      switch (filterType) {
          case 'all':
              todo.style.display = '';
              this.el.querySelector('.filters a[href="#/"]').classList.add('selected');
              break;
          case 'active':
              todo.style.display = isCompleted ? 'none' : '';
              this.el.querySelector('.filters a[href="#/active"]').classList.add('selected');
              break;
          case 'completed':
              todo.style.display = isCompleted ? '' : 'none';
              this.el.querySelector('.filters a[href="#/completed"]').classList.add('selected');
              break;
      }
  });
}


}
