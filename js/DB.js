export default class DB {
    static setApiURL(data) {
      this.apiURL = data;
    }
  
    static async findAll() {
      const response = await fetch(this.apiURL + "/todos");
      return await response.json();
    }

    static async addOne(data) {
      const response = await fetch(this.apiURL + "/todos",{
        method : 'post',
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    }

    static async update(id, data) {
      const response = await fetch(`${this.apiURL}/todos/${id}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Une erreur est survenue lors de la mise à jour');
      }
    }
    
    static async delete(id) {
      try {
        const response = await fetch(`${this.apiURL}/todos/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Une erreur est survenue lors de la suppression :", error);
      }
    }
    
    

  }