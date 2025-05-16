import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import helmet from 'helmet';
/* ROUTE IMPORTS */
import dashboardRoutes from './routes/dashboardRoutes'; 
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import expenseRoutes from './routes/expenseRoutes';



/* CONFIGURATIONS  */ 

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use("/dashboard", dashboardRoutes); //dashboard
app.use("/products", productRoutes) //product
app.use("/users", userRoutes) //user
app.use("/expenses", expenseRoutes); //expense
/* SERVER */

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})