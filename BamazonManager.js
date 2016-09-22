// require npm packages 
var mysql = require('mysql');
var inquirer = require('inquirer');
var table = require('console.table');
//wholesale price (85% of retail)
var margin = .85;
// establish database connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "!!CRUMBLE!@8i6", //Your password
    database: "Bamazon_DB"
});
// set up inquirer choices
function start(){
		//Display information options
		inquirer.prompt({
			name:'choice',
			type:'list',
			choices:['Exit','View Products for Sale','View Low Inventory','Add to Inventory','Add New Product'],
			message:'Which option would you like?'
		}).then(function(answer){
				//switch based on manager choice - default calls the start() function recursively - not needed because
				// the list limits user choices
				switch(answer.choice){
					case 'Exit':{
						end();
					}
					// view inventory
					case 'View Products for Sale':{
						console.log('Total Inventory:');
						// query products table to get everything in stock
						connection.query('SELECT * FROM Products', function(err, res){
							if (err) {throw(err);}
							var inventory=[];
							// cycle thru the result & push to the display array 'inventory'
							for (var i=0;i<res.length;i++){
								inventory.push([res[i].ItemID, res[i].ProductName,res[i].Price.toFixed(2),res[i].StockQuantity]);
							}
							// Use console.table to format output
								console.table(['ID','Product Name','Price($)','Quantity'],inventory);
								start();
						});
						break;
					}
					// view products with less than 5 units in stock
					case 'View Low Inventory':{
						console.log('Inventory less than 5 units');
						// query database
						connection.query('SELECT * FROM Products', function(err, res){
							if (err) {throw(err);}
							var inventory=[];
							// cycle thru result & only push items with less than 5 quantity to the display array 'inventory'
							for (var i=0;i<res.length;i++){
								if (res[i].StockQuantity<5){
									inventory.push([res[i].ItemID, res[i].ProductName,res[i].Price.toFixed(2),res[i].StockQuantity]);
								}
							}
							// use console.table to format the data
								console.table(['ID','Product Name','Price($)','Quantity'],inventory);
								start();
						});
						break;
					}
					// buy additional inventory
					case 'Add to Inventory':{
						// query the database to find items currently in stock
						connection.query('SELECT * FROM Products', function(err, res){
							if (err) {throw(err);}
							// Load the list into the choices for the 'addInventory' list
							inquirer.prompt({
								name:'addInventory',
								type:'list',
								// push product values to array & return the resulting object
								choices:function(value){
										var choiceArray=['Exit'];
										for (var i=0;i<res.length;i++){
	                    					choiceArray.push('Item : '+res[i].ItemID+', Name: '+
	                    						res[i].ProductName+', Price: $'+res[i].Price.toFixed(2)+', Quantity = '+res[i].StockQuantity);
                    					}
                    					return choiceArray;
									},
								message:'Which item would you like to add inventory?'
								// Once user has made choice add the inventory
							}).then(function(add){
								// if user chooses 'Exit', return to the main menu
								if (add.addInventory==='Exit'){
									start();
								} else {
									//prompt manager for # of items to be ordered
									inquirer.prompt({
										name:'quantity',
										type:'input',
										message:'How many items?'
									}).then(function(number){
										var updateID=returnItemId(add.addInventory,7);
										var ordered=parseInt(number.quantity);
										var updateQuant=ordered+res[updateID-1].StockQuantity;
										// update database with new stock quantity
										connection.query("UPDATE Products SET ? WHERE ?", [{
										    StockQuantity: updateQuant
										}, {
										    ItemID: updateID
										}], function(err, res) {});
										//compute total cost based on wholesale price - for this app, it's assumed to be 85% of sales price
										var totalCost=ordered*res[updateID-1].Price*margin;
										// query the database and add the cost of the new inventory to the overhead
										connection.query('SELECT * FROM departments WHERE ?',{DepartmentName:res[updateID-1].DepartmentName},
										 	function(error, results){
												if (error) throw(error);
												// compute new total overhead costs for the department purchased from
												var totalOverHead=totalCost+results[0].OverHeadCosts;
												connection.query('UPDATE departments SET ? WHERE ?',[{OverHeadCosts:totalOverHead},
													{DepartmentName:res[updateID-1].DepartmentName}], function(err2,res2){
														if (err2) throw(err2);
											});
										});
										// tell user what additional inventory cost
										console.log('Additional inventory ordered, cost= $'+(totalCost).toFixed(2));
										start();
									});
								}
							});
						});
						break;
					}
					// Add new products to the display list
					case 'Add New Product':{
						inquirer.prompt([
							// Get user data on his/her new product
							{
								type:"input",
								message:"Product Name:",
								name:"pname"
							},
							{
								type:"input",
								message:"Department Name:",
								name:"dname"
							},
							{
								type:"input",
								message:"Price:",
								name:"price"
							},
							{
								type:"input",
								message:"Quantity:",
								name: "quant"
							}
						]).then(function(out){
							// Insert new product into database
							connection.query('INSERT INTO Products SET ?',{
								ProductName:out.pname,
								DepartmentName:out.dname,
								Price:out.price,
								StockQuantity:out.quant
								}, function(err, res3){});
							console.log('Successful update, cost= $'+(out.quant*out.price).toFixed(2));
							start();
						});
						break;
					}
					default:{
						start();
						break;
					}
				}
			});	
		}
start();
// take a string and a position in it & remove letters to the left of the passed integer
// return an integer
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

// end connection & terminate program
function end(){
	connection.end();
	process.exit();
}
