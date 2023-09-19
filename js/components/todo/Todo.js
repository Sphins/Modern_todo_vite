import getTemplate from './template.js';
import './styles.scss';
import DB from "../../DB.js";

export default class Todo {
  // Constructeur de la classe Todo
  constructor(data) {
    this.id = data.id;
    this.content = data.content;
    this.completed = data.completed;
    this.createdAt = data.createdAt;
  }

  // Méthode pour afficher un todo
  render(el) {
    el.insertAdjacentHTML('beforeend', getTemplate(this));
    const newTodo = el.lastElementChild;

    // Ajout d'un écouteur d'événement pour le changement d'état du todo
    const checkbox = newTodo.querySelector('.toggle');
    if (checkbox) {
      checkbox.addEventListener('change', this.toggleCompleted.bind(this));
    }
    
    // Ajout d'un écouteur d'événement pour la suppression du todo
    const deleteButton = newTodo.querySelector('.destroy');
    if (deleteButton) {
      deleteButton.addEventListener('click', this.deleteTodo.bind(this));
    }
    
    // Ajout d'un écouteur d'événement pour l'édition du contenu du todo
    const label = newTodo.querySelector('.content');
    if (label) {
      label.addEventListener('dblclick', this.editTodo.bind(this));
    }
  }

  // Méthode pour changer l'état d'un todo
  async toggleCompleted(e) {
    this.completed = e.target.checked;
    const todoElement = e.target.closest('li');

    try {
      await DB.update(this.id, { completed: this.completed });

      if (this.completed) {
        todoElement.classList.add('completed');
      } else {
        todoElement.classList.remove('completed');
      }
    } catch (error) {
      console.error('Failed to update todo', error);
    }
    this.updateCount();
  }

  // Méthode pour supprimer un todo
  async deleteTodo(e) {
    await DB.delete(this.id);
    const todoElement = e.target.closest('li');
    if (todoElement) {
        todoElement.remove();
    }

    const index = this.todoListInstance.todos.indexOf(this);
    if (index > -1) {
        this.todoListInstance.todos.splice(index, 1);
    }

    this.updateCount();
  }

  // Méthode pour mettre à jour le contenu d'un todo
  async updateContent(e) {
    this.updateTask = e.target.content;
    const todoElement = e.target.closest('li');

    try {
      await DB.update(this.id, { content: this.content });
    } catch (error) {
      console.error('Failed to update todo', error);
    }
    this.updateCount();
  }

  // Méthode pour éditer un todo
  editTodo(e) {
    const label = e.target;
    const listItem = label.closest('li');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = this.content;
    input.className = 'edit'; 
    input.addEventListener('blur', this.updateTodo.bind(this));
    input.addEventListener('keyup', (e) => {
      if (e.code === 'Enter' && input.value.trim() !== '') {
        input.blur();
      }
    });
    listItem.appendChild(input);
    listItem.classList.add('editing');
    input.focus();
}

  // Méthode pour mettre à jour un todo après édition
  async updateTodo(e) {
    const input = e.target;
    const newContent = input.value.trim();
    const listItem = input.closest('li');
    const label = listItem.querySelector('.content');
    label.textContent = newContent;
    listItem.removeChild(input);
    listItem.classList.remove('editing');

    try {
      await DB.update(this.id, { content: newContent });
      this.content = newContent;
    } catch (error) {
      console.error('Failed to update todo', error);
    }
}

updateCount() {
  const event = new Event('updateCounter');
  document.dispatchEvent(event);
}



}
