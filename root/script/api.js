// JS for communicating with the snowbudget backend.
//
//      Connor Shugg

// Other globals
const url = window.location.protocol + "//" + window.location.host;

// Document globals
const bclass_expense_container = document.getElementById("bclass_expenses");
const bclass_income_container = document.getElementById("bclass_income");
const summary_container = document.getElementById("budget_summary");

// ========================== Server Communication ========================== //
// Takes in an endpoint string, HTTP method, and JSON message body and sends a
// HTTP request to the server.
async function send_request(endpoint, method, jdata)
{
    // build a request body string, if JSON data was given
    let request_body = null;
    if (jdata)
    { request_body = JSON.stringify(jdata); }

    // send a request to the correct server endpoint
    let response = await fetch(url + endpoint, {
        method: method, body: request_body
    });

    // retrieve the response body and attempt to parse it as JSON
    let text = await response.text();
    return JSON.parse(text);
}

// Used to retrieve all budget data from the server.
async function retrieve_data()
{
    data = await send_request("/get/all", "GET", null);
    if (!data.success)
    {
        let message = "failed to retrieve content (" + data.message + ")."
        console.log(message);
    }
    return data;
}

// ============================ Helper Functions ============================ //
// Takes in a float value and returns a US-dollar-formatted string.
function float_to_dollar_string(value)
{
    let formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(value);
}

// Takes in a float/integer timestamp and returns a string formatted as a date.
function timestamp_to_date_string(value)
{
    let date = new Date(value * 1000.0);
    let str = date.getFullYear() + "-";
    str += date.getMonth() + 1 + "-";
    str += date.getDate();
    return str;
}

// Returns true if the given class is an expense class.
function bclass_is_expense(bclass)
{
    t = bclass.type.toLowerCase();
    return t === "e" || t === "expense";
}

// Returns true if the given class is an income class.
function bclass_is_income(bclass)
{
    t = bclass.type.toLowerCase();
    return t === "i" || t === "income";
}

// Computes the sum of all the bclass's transactions and returns it.
function bclass_sum(bclass)
{
    let sum = 0.0;
    for (let i = 0; i < bclass.history.length; i++)
    { sum += bclass.history[i].price; }
    return sum;
}


// ============================== Interaction =============================== //
// Invoked when a transaction row is clicked in a budget class table.
function click_transaction_row(ev)
{
    // pull out the correct table row that was clicked so we can find the
    // correct transaction
    let tr = null;
    for (let i = 0; i < ev.path.length; i++)
    {
        if (ev.path[i].className.includes("ttable-transaction-row"))
        {
            tr = ev.path[i];
            break;
        }
    }
    // if we couldn't find anything, log and return
    if (tr == null)
    {
        console.log("Couldn't find transaction table row.");
        return;
    }

    let transaction_id = tr.id;
    console.log("TODO: OPEN TRANSACTION: " + transaction_id);
}


// ============================= HTML Elements ============================== //
// Used to create a simply HTML error message.
function make_error_message(msg)
{
    return "<p><b style=\"color: red\">Error:</b> " + msg + "</p>";
}

// Makes a collapsible button element with the given ID and text.
function make_collapsible_button(id, text, rtext, classes, rclasses)
{
    // create the button and set all appropriate fields
    let btn = document.createElement("button");
    btn.id = id;
    btn.className = "collapsible-button " + classes;
    btn.innerHTML = text;

    // create the indicator and append it
    let span = document.createElement("span");
    span.className = "collapsible-button-indicator " + rclasses;
    span.innerHTML = rtext;
    btn.appendChild(span);
    return btn;
}

// Makes a collapsible content element with the given ID.
function make_collapsible_content(id)
{
    let div = document.createElement("div");
    div.id = id;
    div.className = "collapsible-content";
    return div;
}

// Puts together HTML to be stored in a budget class's collapsible content
// section. Acts as a menu for the budget class.
function make_bclass_menu(bclass)
{
    // create a div to contain the menu
    let div = document.createElement("div");
    div.className = "button-container";

    // add the description to the div
    let desc = document.createElement("p");
    desc.innerHTML = bclass.description;
    div.appendChild(desc);
    
    return div;
}

// Puts together a HTML element containing a summary of all transactions within
// the given budget class.
function make_bclass_history(bclass)
{
    // if there are no transactions recorded, make a simple element and return
    if (bclass.history.length == 0)
    {
        let msg = document.createElement("p");
        msg.innerHTML = "";
        return msg;
    }

    // sort the history by timestamp
    bclass.history.sort(function(t1, t2) { return t2.timestamp - t1.timestamp; });

    // create a div to contain the table
    let tdiv = document.createElement("div");
    tdiv.className = "ttable-container";

    // create a table and set up its class names
    let table = document.createElement("table");
    table.className = "ttable";
    if (bclass_is_expense(bclass))
    { table.className += " color-expense3"; }
    else if (bclass_is_income(bclass))
    { table.className += " color-income3"; }

    // set up the first row (the headers)
    let row1 = document.createElement("tr");
    row1.className = "ttable-row";
    let columns = ["Date", "Price", "Vendor", "Description"];
    for (let i = 0; i < columns.length; i++)
    {
        let th = document.createElement("th");
        th.className = "ttable-header";
        // set up bolded text with a specific text color for the cell
        span = document.createElement("span");
        span.className = "color-text1";
        span.innerHTML = "<b>" + columns[i] + "</b>";
        th.appendChild(span);
        // append the entry to the row
        row1.appendChild(th);
    }
    table.appendChild(row1);

    // now, iterate across each transaction in the class and add it to the table
    for (let i = 0; i < bclass.history.length; i++)
    { 
        // create a 'tr' object and set up the array of cell values
        let t = bclass.history[i];
        let row = document.createElement("tr");
        row.className = "ttable-transaction-row";
        row.id = t.id;
        let values = [timestamp_to_date_string(t.timestamp),
                      float_to_dollar_string(t.price),
                      t.vendor, t.description];
        
        // add each cell value as a new 'td' element
        for (let j = 0; j < values.length; j++)
        {
            let td = document.createElement("td");
            td.className = "ttable-cell";
            // make a paragraph element with a certain text color for the cell
            span = document.createElement("span");
            span.className = "color-text1";
            span.innerHTML = values[j];
            td.appendChild(span);
            // append the entry to the row
            row.appendChild(td);
        }

        // add a click listener to the row (so we can click on the row)
        row.addEventListener("click", click_transaction_row);
        
        // append the row to the table
        table.appendChild(row);
    }
    
    // put the table into the container and return it
    tdiv.appendChild(table);
    return tdiv;
}

// =============================== UI Updates =============================== //
// Used to refresh the summary written at the top of the page.
async function summary_refresh(bclasses)
{
    summary_container.innerHTML = "";
    // we'll compute some statistics
    let total_expense = 0.0;    // total expense costs
    let total_income = 0.0;     // total income gain
    let total = 0.0;            // net gain/loss total
 
    // iterate through every budget class
    for (let i = 0; i < bclasses.length; i++)
    {
        // increment the sums for all categories
        let sum = bclass_sum(bclasses[i]);
        if (bclass_is_expense(bclasses[i]))
        { total_expense += sum; }
        else if (bclass_is_income(bclasses[i]))
        { total_income += sum; }
    }
    total = total_income - total_expense;
    
    let elem = document.createElement("p");
    // create an element for the total expenses
    let total_expense_elem = document.createElement("b");
    total_expense_elem.className = "color-expense1";
    total_expense_elem.innerHTML = "Total expenses: ";
    elem.appendChild(total_expense_elem);
    elem.innerHTML += float_to_dollar_string(total_expense) + "<br>";

    // create an element for the total income
    let total_income_elem = document.createElement("b");
    total_income_elem.className = "color-income1";
    total_income_elem.innerHTML = "Total income: ";
    elem.appendChild(total_income_elem);
    elem.innerHTML += float_to_dollar_string(total_income) + "<br>";

    // create an element for the net value
    let total_elem = document.createElement("b");
    // create a specific message depending on the total net value
    let net_str = "Broken even!";
    if (total < 0.0)
    {
        total_elem.className += "color-acc4";
        net_str = "In-the-hole: ";
    }
    else if (total > 0.0)
    {
        total_elem.className += "color-acc2";
        net_str = "Extra cash: ";
    }
    total_elem.innerHTML = net_str;
    // add to the main element, then add the 'total' value, if necessary
    elem.appendChild(total_elem);
    if (total != 0.0)
    { elem.innerHTML += float_to_dollar_string(total); }
    
    // append to the main div to add to the document
    summary_container.appendChild(elem);
}

// Used to refresh the main menu.
async function menu_refresh(bclasses)
{
    // TODO
}

// Used to update a single budget class UI element.
async function budget_class_refresh(bclass)
{
    // take the budget class' ID and look for an element within the main div.
    // If one doesn't exist, we'll create it and add it to the correct div
    bclass_div = document.getElementById(bclass.id);
    if (!bclass_div)
    {
        bclass_div = document.createElement("div");
        bclass_div.id = bclass.id;
        // depending on the type, append to the correct child
        if (bclass_is_expense(bclass))
        { bclass_expense_container.appendChild(bclass_div); }
        else if (bclass_is_income(bclass))
        { bclass_income_container.appendChild(bclass_div); }
        else
        { console.log("Found budget class of unknown type: " + bclass.id); }
    }

    // look for the collapsible button corresponding to the bclass. If we can't
    // find it, we'll create one
    btn_id = bclass.id + "_btn";
    bclass_btn = document.getElementById(btn_id);
    if (!bclass_btn)
    {
        // pick out classes based on if it's an expense or income class
        classes = "font-main";
        rclasses = "font-main";
        if (bclass_is_expense(bclass))
        {
            classes += " color-expense1";
            rclasses += " color-expense2";
        }
        else if (bclass_is_income(bclass))
        {
            classes += " color-income1";
            rclasses += " color-income2";
        }

        // create the button and add it to the div (making the right-hand text
        // the total dollar value of the class)
        let sumstr = float_to_dollar_string(bclass_sum(bclass));
        bclass_btn = make_collapsible_button(btn_id, bclass.name, sumstr,
                                             classes, rclasses);
        bclass_div.appendChild(bclass_btn);
    }

    // look for the collapsible content corresponding to the bclass. If we
    // can't find it, we'll create one
    content_id = bclass.id + "_content";
    bclass_content = document.getElementById(content_id);
    if (!bclass_content)
    { 
        bclass_content = make_collapsible_content(content_id);
        bclass_div.appendChild(bclass_content);
        collapsible_init(bclass_btn);
        
        // add a menu to the bclass's content section, then add a listing of
        // the class's transaction history
        bclass_content.appendChild(make_bclass_menu(bclass));
        bclass_content.appendChild(make_bclass_history(bclass))
    }
}

// Used to update ALL budget class UI elements.
async function budget_classes_refresh(bclasses)
{
    // iterate through each budget class and refresh it
    for (let i = 0; i < bclasses.length; i++)
    { budget_class_refresh(bclasses[i]); }
}


// ============================= Initialization ============================= //
// Main initializer for the entire page.
async function ui_init()
{
    let data = await retrieve_data();
    if (!data)
    {
        console.log("Failed to retrieve data.");
        return;
    }

    // extract the payload and sort them (budget classes) by name
    let bclasses = data.payload;
    bclasses.sort(function(c1, c2) { return c1.name.localeCompare(c2.name); });

    // pass the budget classes to refresh functions
    summary_refresh(bclasses);
    menu_refresh(bclasses);
    budget_classes_refresh(bclasses);
}

// Function that's invoked upon window-load.
window.onload = function()
{
    ui_init();
}

