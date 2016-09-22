// require npm packages
var mysql = require('mysql');
var inquirer = require('inquirer');

// Establish connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "!!CRUMBLE!@8i6", //Your password
    database: "Bamazon_DB"
});

// start function sets up the list of items for sale
function start(){
	//Display items in the database
	connection.query('SELECT * FROM Products', function(err1, res1){
		inquirer.prompt({
			name:'choice',
			type:'list',
			//Access the database pull down the each item & push it to the array of products
			choices:function(value){
				// First value in list allows user to exit the app
                var choiceArray = ['Exit'];
                for (var i = 0; i < res1.length; i++) {
                    choiceArray.push('Item : '+res1[i].ItemID+', Name: '+res1[i].ProductName+', Price: $'+res1[i].Price.toFixed(2));
                }
                return choiceArray;
			},
			message:'Which item would you like to buy?'
		}).then(function(answer){
				// function call strips away test & returns the id of the item chosen
				var chosenId=returnItemId(answer.choice,7)-1;
				// function asks user how many & updates inventory database using callback function 'updateInventory'
				howMany(answer,res1[chosenId], updateInventory);
			});	
		});
}
// call to start function to run the code
start();
// function takes a string and a number & strips away every character
// before the one chosen. Returns an integer
function returnItemId(string,place){
	var id='';
	for (var i=place;i<string.length;i++){
		if (string.charAt(i)!=','){
			id+=string.charAt(i);
		}else {
			return parseInt(id);
		}
	}
}
// function takes in the answer from the prior inquirer answers, the object with product info
// and a callback function which executes the next program step
function howMany(answer, result, callback){
	// if user chooses exit, terminate the program
	if (answer.choice==='Exit'){end();};
	inquirer.prompt({
		name:'quantity',
		type:'input',
		message: 'How many would you like to buy (0 to return to the products menu)?'
	}).then(function(number){
		callback(answer,number.quantity,result);
	});
}

// arguments are the previous inquirer answer, the number of units from howMany(), and
// the item object
function updateInventory(answer,userBuy,res){
	// if user chooses zero items, return to the main menu
	if (userBuy==0){
		start();
	// if insufficient stock notify the user & call the function recursively
	}else if(res.StockQuantity<userBuy){
		console.log('Sorry, but we only have '+res.StockQuantity+' in stock');
		howMany(answer,res,updateInventory);
	// if user enters a negative number, chastise him/her and call the function recursively	
	}else if (userBuy <0){
		console.log('Dude get real!');
		howMany(answer,res,updateInventory);
	}else {
			// Update the products database with the new stock number
			connection.query('UPDATE Products SET ? WHERE ?',[{StockQuantity:(res.StockQuantity-userBuy)},
			{ProductName:res.ProductName}], function(err, res){
				if (err) throw(err);
			});
			// compute total sales by multiplying units bought by unit price
			var totalSale=(userBuy*res.Price).toFixed(2);
			console.log('');
			console.log('***********************************************************************');
			console.log('Order fulfilled, cost of your order is $'+ totalSale);
			console.log('***********************************************************************');
			console.log('');
			// update the departments database adding the new sales numbers
			connection.query('SELECT * FROM departments WHERE ?',{DepartmentName:res.DepartmentName}, function(error, results){
				if (error) throw(error);
				var depsales=parseFloat(totalSale)+results[0].TotalSales;
				connection.query('UPDATE departments SET ? WHERE ?',[{TotalSales:depsales},
					{DepartmentName:res.DepartmentName}], function(err2,res2){
						if (err2) throw(err2);
				});
			});
			// insert the transaction into the transactions table
			connection.query('INSERT INTO Transactions SET ?',{
				DepartmentName:res.DepartmentName,
				ProductName:res.ProductName,
				QuantitySold:userBuy
				}, function(err, res3){});
			// return to main menu
			start();
	}

}
// terminate the database connection & end the program
function end(){
	connection.end();
	process.exit();
}
