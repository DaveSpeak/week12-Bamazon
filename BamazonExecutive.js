// require npm packages
var mysql = require('mysql');
var inquirer = require('inquirer');
var table = require('console.table');
// establish database connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "!!CRUMBLE!@8i6", //Your password
    database: "Bamazon_DB"
});

function start(){
		//Display information options
		inquirer.prompt({
			name:'choice',
			type:'list',
			choices:['Exit','View Product Sales by Department','Create New Department','All Transactions from a Department'],
			message:'Which option would you like?'
		}).then(function(answer){
				// switch on user answer to inquirer prompt
				switch(answer.choice){
					// User chooses to exit program
					case 'Exit':{
						end();
					}
					// All product sales by department including overhead costs and profits (which are calculated here & not stored in a db)
					case 'View Product Sales by Department':{
						// query database for current sales information by department
						connection.query('SELECT * FROM Departments', function(err, res){
							if (err) {throw(err);}
							var depstats=[];
							// cycle thru result & push data to array 'depstats'
							for (var i=0;i<res.length;i++){
								depstats.push([res[i].DepartmentID, res[i].DepartmentName,res[i].OverHeadCosts.toFixed(2),res[i].TotalSales.toFixed(2),
									(res[i].TotalSales-res[i].OverHeadCosts).toFixed(2)]);
							}
							//display options with console.table
					        	console.log('');
								console.table(['DepartmentID','Department Name','Over Head Costs($)','Product Sales($)','Total Profit($)'],depstats);
								start();
						});
						break;
					}
					// ask user for information on new department
					case 'Create New Department':{
						inquirer.prompt([
							{
								type:"input",
								message:"Department Name:",
								name:"dname"
							},
							{
								type:"input",
								message:"Initial Over Head Costs:",
								name:"ohcost"
							},
							{
								type:"input",
								message:"Initial Product Sales:",
								name:"ipsales"
							}
						]).then(function(out){
							// insert new department into the Departments database
							connection.query('INSERT INTO Departments SET ?',{
								DepartmentName:out.dname,
								OverHeadCosts:out.ohcost,
								TotalSales:out.ipsales
								}, function(err, res3){
								});
							console.log('Department Created.');
							start();
						});
						break;
					}
					case 'All Transactions from a Department':{
						// get all individual sales information from database for a selected department
						connection.query('SELECT * FROM Departments', function(err1, res1){
							// populate list with department names
							inquirer.prompt({
								name:'choice',
								type:'list',
								// push individual values to the 'choiceArray' object - first value moves one menu level up
								choices:function(value){
					                var choiceArray = ['Next menu up'];
					                for (var i = 0; i < res1.length; i++) {
					                    choiceArray.push('Department: '+res1[i].DepartmentName);
					                }
					                return choiceArray;
								},
								message:'Which Department would you like to see?'
							}).then(function(answer){
								// use join to extract quantity sold of each item from transactions table and the price of each item from
								// the products table
								var depo=returnItemIdS(answer.choice,12);
				            	var productItem=[];
				            	var productSales=[];
				            	// join two tables (transactions and products), return sales numbers & price data
						        var query = 'SELECT Transactions.ProductName, Transactions.QuantitySold, Products.Price FROM Transactions ';
						        query += 'INNER JOIN Products ON (Products.DepartmentName = Transactions.DepartmentName AND Products.ProductName=Transactions.ProductName) ';
						        query += 'WHERE (Products.DepartmentName = ?) ORDER BY Products.ProductName ';
					            connection.query(query, depo, function(err, res) {
					            	// push product information to the productItem object for display
						            for (var i = 0; i < res.length; i++) {
						            	var totalRev=res[i].QuantitySold*res[i].Price;
						                productItem.push([depo,res[i].ProductName, res[i].QuantitySold, res[i].Price.toFixed(2),totalRev.toFixed(2)]);
					            	};
					        	}).on('end', function(){
					        		// output a table with all the good data in it
					        		if (productItem!='') {
						        		console.log('');
						        		console.table(['Department Name','Product Name','Quantity Sold','Price($)','Total Revenue($)'],productItem);
						        		console.log('');
						        	// console log if no sales from the department.
					        		}else {
					        			console.log('');
					        			console.log('No product sales from department '+depo);
						        		console.log('');
					        		}
					        		// Call start() function to get back to the main menu
						        	start();
					        	});
							});	
						});
						break;
					}
					// default restarts the main menu
					default:{
						start();
						break;
					}
				}
			});	
		}
start();
// function truncates a string a number of places to the left - just remembered there's a string operator
// to do this, but this function works & I'm too tired now to change the code now
function returnItemIdS(string,place){
	var id='';
	for (var i=place;i<string.length;i++){
			id+=string.charAt(i);
		}
	return id;
}


// end database connection & exit program
function end(){
	connection.end();
	process.exit();
}
