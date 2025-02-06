const generateId = () => {
    let random = "abcdefghijklmnopqrstuvwxyz1234567890";
    let id = "";
    for (let i = 0; i < 5; i++) {
      let randomIndex = Math.floor(Math.random() * random.length);
      id += random[randomIndex];
    }
    return id;
  }
  
  export default generateId;