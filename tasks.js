//Import Fs module
const { readFile, writeFile } = require("fs").promises;
const readline = require("readline");

async function getAllTasks(){
    try {
        const content = await readFile("tasks.json", "utf8");
        const taskArray = JSON.parse(content);
        return (taskArray);
    } catch (err){
        if (err.code === 'ENOENT'){
            console.warn("tasks.json file not found, starting with an empty list.");
            return [];
        }
        if (err instanceof SyntaxError){
            console.error("Error parsing tasks.json, file may be curropted.");
            return [];
        }
        console.error("Error getting tasks: ", err.message);
    }
    };

async function listTasks() {
    try{
        const tasks = await getAllTasks();

        if(!Array.isArray(tasks) || tasks.length === 0) {
            console.log("No tasks found.");
            return;
        }

        tasks.forEach(task => {
            const title = task.title ?? "(no title)";
            const status = task.status ?? "(no status)";
            console.log(`\t${title} : ${status}`);
            });
    } catch (err) {
        console.error("Error listing tasks: ", err.message);
    }
};

async function addTask(newTitle, newDescription){
    try {

        if (!newTitle || typeof newTitle !== "string"){
            throw new Error("A valid task title is required");
        }

        const newTask = {
            title: newTitle,
            description: newDescription || "", //Adds empty string if newDescription not provided
            status: "not completed",   // default value
        };

        let tasksArray = await getAllTasks();

            if(!Array.isArray(tasksArray) || tasksArray.length === 0) {
                console.log("No tasks found. Resetting to Empty List");
                tasksArray = [];
            }

        tasksArray.push(newTask);

        await writeFile("tasks.json", JSON.stringify(tasksArray, null, 2), "utf8");
        console.log(`Task ${newTitle} has been added`);
    } catch (err) {
        console.error("Error encountered while adding task", err.message);
    }
};

async function completeTask(title){
    try{
        if (!title || typeof title !== "string"){
            throw new Error("A valid task title is required");
        }

        let tasksArray = await getAllTasks();

            if(!Array.isArray(tasksArray) || tasksArray.length === 0) {
                console.log("No tasks found.");
                return;
            }

        const task = tasksArray.find(t => t.title === title);

        if (!task){
            console.log(`Task ${title} not found`);
            return;
        }

        task.status =  "completed";

        await writeFile("tasks.json", JSON.stringify(tasksArray, null, 2), "utf8");
        console.log(`Task "${title}" marked as completed`);
    } catch (err){
        console.error("Error completing task:", err.message);
    }
};

const menuPrompt = '\nEnter 1 to List all tasks.\nEnter 2 to Add a new task.\nEnter 3 to Mark a task as completed.\nEnter "exit" to leave.\nEnter Selection: ';
console.log("Welcome to the task manager. Please select from the following:")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: menuPrompt 
});

rl.prompt();

rl.on('line', async (line) => {
    const input = line.trim();

    try{
        if(!input) {
            console.log("No option detected. Please enter an option.")
            rl.prompt();
            return;
        }

    if (input === '1'){
        console.log("\nListing all tasks:");
        await listTasks();

    } else if (input === '2'){
        console.log('\nAdding a Task requires task Title and Description');
        rl.question('Enter a title: ', (title) => {
            rl.question('Enter a Description: ', async (desc) =>{
                await addTask(title, desc);
                rl.prompt();  
            });
        });
        return;
    

    } else if (input === '3'){
        console.log('\nMarking a Task completed requires a task Title');
        rl.question('Enter a title: ', async (title) => {
            try {
                await completeTask(title);
            } catch (err){
                console.error('Error completing task:', err.message);
            }
            rl.prompt();  
        });
        return;


    } else if (input.toLowerCase() === 'exit'){
        rl.close();
        return;

    } else {
        console.log("Your command is unreccognized. Please try again from the following options.");
    }
    } catch (err){
        console.log("Unexpected Error:", err.message);
    }

  rl.prompt();  
});

rl.on('close', () => {
  console.log('Goodbye!');
});