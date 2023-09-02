import express, {json} from "express";
import mysql, {Pool} from "promise-mysql";
import dotenv from 'dotenv';

export const router = express.Router();

let pool:Pool;

dotenv.config();

initPool();

async function initPool(){
    pool = await mysql.createPool({
        host:process.env.host,
        port:+process.env.port!,
        database:process.env.database,
        user:process.env.username,
        password:process.env.password,
        connectionLimit:+process.env.connection_limit!
    })
}


type Task = {
    id: number,
    description: String,
    status: 'COMPLETED' | 'NOT_COMPLETED' | undefined
}

/* Get all tasks */
router.get("/",async (req, res)=>{
    const task = await pool.query("SELECT * FROM task");
    res.json(task);
});



/*Create a new task*/
router.post("/", async (req, res)=>{
    const task = req.body as Task;
    if(!task.description?.trim()) {
        res.sendStatus(400);
        return;
    }

    const result = await pool.query("INSERT INTO task (description, status) VALUES (?,DEFAULT)",[task.description]);

    task.id = result.insertId;
    task.status = 'NOT_COMPLETED';
    res.status(201).json(task);
});

/* Delete an existing task */
router.delete("/:taskId", async (req, res)=>{
    const result = await pool.query("DELETE FROM task WHERE id=?", [req.params.taskId]);
    res.sendStatus(result.affectedRows ? 204 : 404);
});


/* Update an existing task*/
router.patch('/:taskId', async (req, res) => {
    const task:Task = (req.body as Task);
    console.log(task.status);
    /*if(!task.status){
        res.sendStatus(400);
        return;
    }*/
    const result = await pool.query("UPDATE task SET description=?, status=? WHERE id=?", [task.description, task.status, req.params.taskId]);

    if (result.affectedRows == 0){
        res.sendStatus(404);
    }else{
        res.status(204).json(task);
    }
});