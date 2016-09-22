CREATE DATABASE Bamazon_DB;

USE Bamazon_DB;

CREATE TABLE Products(
  ItemID INT NOT NULL AUTO_INCREMENT,
  ProductName VARCHAR(100) NOT NULL,
  DepartmentName VARCHAR(50) NOT NULL, 
  Price DECIMAL(8,2) default 0,
  StockQuantity INT default 0,
  PRIMARY KEY (ItemID)
);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("Hi-Def TV", "Electronics", 1200.00, 5);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("iPhone7", "Electronics", 750.00, 500);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("Tuxedo", "Clothing", 500.00, 1);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("Luxury Vacation to the Cayman Islands", "Travel", 3000.00, 1);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("Food Processor", "Kitchen", 100.00, 25);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("Sofa-bed", "Household", 900.00, 10);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("Apple Powerbook 15", "Computer", 2000.00, 50);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("Smart Mouse USB", "Computer", 40.00, 150);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("Kitchen Knife set", "Kitchen", 100.00, 87);

INSERT INTO Products(ProductName,DepartmentName,Price,StockQuantity)
VALUES ("Luxury Ball Gown", "Clothing", 750.00, 12);

CREATE TABLE Departments(
  DepartmentID INT NOT NULL AUTO_INCREMENT,
  DepartmentName VARCHAR(50) NOT NULL,
  OverHeadCosts DECIMAL(8,2) default 0,
  TotalSales DECIMAL(10,2) default 0,
  PRIMARY KEY (DepartmentID)
);

INSERT INTO Departments(DepartmentName,OverHeadCosts,TotalSales)
VALUES ("Clothing", 5000.00, 10000.00);

INSERT INTO Departments(DepartmentName,OverHeadCosts,TotalSales)
VALUES ("Kitchen", 2000.00, 8000.00);

INSERT INTO Departments(DepartmentName,OverHeadCosts,TotalSales)
VALUES ("Computer", 20000.00, 15000.00);

INSERT INTO Departments(DepartmentName,OverHeadCosts,TotalSales)
VALUES ("Household", 12000.00, 9000.00);

INSERT INTO Departments(DepartmentName,OverHeadCosts,TotalSales)
VALUES ("Travel", 3000.00, 5000.00);

INSERT INTO Departments(DepartmentName,OverHeadCosts,TotalSales)
VALUES ("Electronics", 4000.00,18000.00);

USE Bamazon_DB;

CREATE TABLE Transactions(
  TransactionID INT NOT NULL AUTO_INCREMENT,
    DepartmentName VARCHAR(50) NOT NULL,
    ProductName VARCHAR(100) NOT NULL,
  QuantitySold INT default 0,
    PRIMARY KEY (TransactionID)
);
