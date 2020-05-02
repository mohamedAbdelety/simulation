let generate_cdf = pdf => {
    let cdf = []
    for(let i = 1 ;i<pdf.length;i++){
        cdf.push(parseFloat(pdf.slice(0, i+1).reduce((a, b)=> a + b).toFixed(2)))
    }
    return [pdf[0],...cdf]
}
let generate_interval_randomNumber = cdf => {
    let intervals = [],start = 1
    for(let i = 0 ;i<cdf.length;i++){
        intervals.push([start,cdf[i]*100])
        start = cdf[i]*100 + 1
    }
    return intervals
}

let get_demand = (randNumbers,intervals,demand) => {
    let simulate_demand = []
    for(let num of randNumbers){
        for(let i = 0 ;i<intervals.length;i++){
         if(num >= intervals[i][0] && num <= intervals[i][1]){
            simulate_demand.push(demand[i])
            break
         }  
        }
    }
    return simulate_demand
}

let get_lead = (randNumber,intervals,leads) => {
    let simulate_lead
    for(let i = 0 ;i<intervals.length;i++){
        if(randNumber >= intervals[i][0] && randNumber <= intervals[i][1]){
            simulate_lead = leads[i]
        break
        }  
    }
    return simulate_lead
}

let get_daily_expected = (demand,pdf) => {
    let expected = 0
    for(let i = 0 ;i<demand.length;i++){
        expected += demand[i]*pdf[i]
    }
    return expected
}





let montecarlo = () => {
    let demand = []
    let frequency = []
    let pdf = []
    simulate_count = document.getElementById('ns').value
    let randNumbers = []
    for(let i = 0 ; i < simulate_count ; i++){
        randNumbers.push(Math.floor(Math.random() * 100) + 1)
    }
    if(data_type == 1){
        for(let i = 0 ; i < numhistorical ; i++){
            demand.push(parseInt(document.getElementById('demand'+(i+1)).value))
            frequency.push(parseInt(document.getElementById('frequency'+(i+1)).value))
        }
        let frequency_sum = frequency.reduce((a, b)=> a + b)
        pdf = frequency.map(x => x / frequency_sum)
    }else{
        for(let i = 0 ; i < numhistorical ; i++){
            demand.push(parseInt(document.getElementById('demand'+(i+1)).value))
            pdf.push(parseFloat(document.getElementById('probability'+(i+1)).value))
        }
        if(pdf.reduce((a, b)=> a + b) != 1){
            alert('enter valid probablity (must sum all probability equal 1)')
            return
        }
    }
    let cdf =  generate_cdf(pdf)
    let intervals =  generate_interval_randomNumber(cdf)
    let simulate_demand =  get_demand(randNumbers,intervals,demand)
    let total_simulate_demand = simulate_demand.reduce((a, b)=> a + b)
    let expected = get_daily_expected(demand,pdf)
    document.getElementById('services').innerHTML = `   
    <div class="container">
    <div class="row">
        <div class="col-md-12 col-sm-12 col-xs-12">
        <div class="section-headline services-head text-center">
            <h2>Monte Carlo Report</h2>
        </div>
        </div>
    </div>
    <div class="row text-center">
        <div class="services-contents">
            <br><br>
            <div class="col-md-8 col-sm-8 col-xs-12">
                <div class="tab-menu">    
                    <ul class="nav nav-tabs" role="tablist">
                    <li class="active">
                        <a href="#p-view-1" role="tab" data-toggle="tab">Table 1</a>
                    </li>
                    <li>
                        <a href="#p-view-2" role="tab" data-toggle="tab">Table 2 (simulate)</a>
                    </li>
                    </ul>
                </div>
                <div class="tab-content">
                    <div class="tab-pane active" id="p-view-1">
                    <div class="tab-inner">
                            <br><br>
                            <table class="table table-striped">
                                <thead>
                                  <tr style="font-weight: bold;">
                                    <td>Demand</td>
                                    ${frequency.length > 0 ? '<td>Frequency</td>' : ''}
                                    <td>Probality</td>
                                    <td>Cumulative</td>
                                    <td>Interval</td>
                                  </tr>
                                </thead>
                                <tbody>
                                ${Object.keys(demand).map(function (key) {
                                    if(frequency.length > 0 ){
                                        return "<tr><td>" + demand[key] + "</td><td>"+frequency[key]+"</td><td>"+pdf[key].toFixed(2)+"</td><td>"+cdf[key]+"</td><td>"+ intervals[key][0] +" to "+intervals[key][1]+"</td></tr>"           
                                    }else{
                                        return "<tr><td>" + demand[key] + "</td><td>"+pdf[key]+"</td><td>"+cdf[key]+"</td><td>"+ intervals[key][0] +" to "+intervals[key][1]+"</td></tr>" 
                                    }
                                }).join("")}
                                </tbody>
                            </table>
                    </div>
                    </div>
                    <div class="tab-pane" id="p-view-2">
                    <div class="tab-inner">
                        <br><br>
                        <table class="table table-striped">
                            <thead>
                              <tr style="font-weight: bold;">
                                <td>Day</td>
                                <td>Random Number</td>
                                <td>Simulate Day Demand</td>
                              </tr>
                            </thead>
                            <tbody>
                            ${Object.keys(simulate_demand).map(function (key) {
                                let day = parseInt(key)+1
                                return "<tr><td>" + day + "</td><td>"+randNumbers[key]+"</td><td>"+simulate_demand[key]+"</td></tr>"           
                            }).join("")}
                            </tbody>
                        </table>
                    </div>
                    </div>
                </div>
            </div>      
            <div class="col-md-4 col-sm-4 col-xs-12">
                <br><br>
            <div class="faq-details">
                <div class="panel-group" id="accordion">
              
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" class="active" data-parent="#accordion" href="#check1">
                            <span class="acc-icons"></span>Total ${simulate_count}-days Demand
                        </a>
                    </h4>
                    </div>
                    <div id="check1" class="panel-collapse collapse in">
                    <div class="panel-body">
                        <p> ${total_simulate_demand} </p>
                    </div>
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" data-parent="#accordion" href="#check2">
                            <span class="acc-icons"></span> Average Daily Demand
                        </a>
                    </h4>
                    </div>
                    <div id="check2" class="panel-collapse collapse">
                    <div class="panel-body">
                        <p>${Math.round(total_simulate_demand / simulate_count * 100) / 100}</p>
                    </div>
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" data-parent="#accordion" href="#check3">
                            <span class="acc-icons"></span> Expected Daily Demand
                        </a>
                    </h4>
                    </div>
                    <div id="check3" class="panel-collapse collapse">
                    <div class="panel-body">
                        <p>${Math.round(expected * 100) / 100}</p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    </div>
    `
}



let inventory_analysis = () => {
    let inventory_demand = []
    let demand_frequency = []
    let leadtime = []
    let leadtime_frequency = []
    let demand_pdf = []
    let leadtime_pdf = []
    let yearDays = (document.getElementById('hold-by').value == 2) ? parseInt(document.getElementById('year-days').value) : 1
    for(let i = 0 ; i < numhistoricaldemand ; i++){
        inventory_demand.push(parseInt(document.getElementById('inventory_demand'+(i+1)).value))
        if(demand_by == 1){
            demand_frequency.push(parseInt(document.getElementById('demand_frequency'+(i+1)).value))
        }else{
            demand_pdf.push(parseFloat(document.getElementById('demand_probability'+(i+1)).value))
        }
    }
    for(let i = 0 ; i < numhistoricallead ; i++){
        leadtime.push(parseInt(document.getElementById('leadtime'+(i+1)).value))
        if(lead_by == 1){
            leadtime_frequency.push(parseInt(document.getElementById('leadtime_frequency'+(i+1)).value))
        }else{
            leadtime_pdf.push(parseFloat(document.getElementById('leadtime_probability'+(i+1)).value))
        }
    }
    // demand
    if(demand_by == 1){
        let demand_frequency_sum = demand_frequency.reduce((a, b)=> a + b)
        demand_pdf = demand_frequency.map(x => x / demand_frequency_sum)
    }
    let demand_cdf =  generate_cdf(demand_pdf)
    let demand_intervals =  generate_interval_randomNumber(demand_cdf)
    // leadtime
    if(lead_by == 1){
        let leadtime_frequency_sum = leadtime_frequency.reduce((a, b)=> a + b)
        leadtime_pdf = leadtime_frequency.map(x => x / leadtime_frequency_sum)
    }
    let leadtime_cdf =  generate_cdf(leadtime_pdf)
    let leadtime_intervals =  generate_interval_randomNumber(leadtime_cdf)
    simulate_count = document.getElementById('nsa').value
    order_quentity = parseInt(document.getElementById('order-quentity').value)
    reorder_point = parseInt(document.getElementById('reorder-point').value)
    let recieved = [0]
    let begin_inv = [parseInt(document.getElementById('begin').value) || order_quentity]
    let lost_sale = []
    let demand_rands = []
    for(let i = 0 ; i < simulate_count ; i++){
        demand_rands.push(Math.floor(Math.random() * 100) + 1)
    }
    let lead_rands = []
    let simulate_demand = get_demand(demand_rands,demand_intervals,inventory_demand)
    let end_inv = []
    let simulate_lead = []
    let order_state = []
    let ord = 0
    let ord_bool = false
    let order_count = 0
    for(let i = 0 ;i<simulate_count;i++){
        if(begin_inv[i] - simulate_demand[i] < 0){
            end_inv[i] = 0
            lost_sale[i] = Math.abs(begin_inv[i] - simulate_demand[i])
        }else{
            end_inv[i] = begin_inv[i] - simulate_demand[i]
            lost_sale[i] = 0
        }
        if(end_inv[i] <= reorder_point && !ord_bool){
            randn = Math.floor(Math.random() * 100) + 1
            order_state[i] = 'Yes'
            simulate_lead[i] = get_lead(randn,leadtime_intervals,leadtime)
            lead_rands.push(randn)
            order_count++
            ord = simulate_lead[i]
            ord_bool = true
        }else{
            order_state[i] = 'NO'
            lead_rands.push('')
            simulate_lead[i] = ''
        }
        if(i+1<simulate_count){
            if(ord == 0 && ord_bool){
                recieved[i+1] = order_quentity
                ord_bool = false
            }else{
                ord--
                recieved[i+1] = 0
            }
        }
        if(i+1<simulate_count){
            begin_inv[i+1] = end_inv[i] + recieved[i+1]
        }
    }
    let endinv_sum = end_inv.reduce((a, b)=> a + b)
    let lost_sum = lost_sale.reduce((a, b)=> a + b)
    document.getElementById('invo-report').innerHTML = `   
    <div class="container">
    <div class="row">
        <div class="col-md-12 col-sm-12 col-xs-12">
        <div class="section-headline services-head text-center">
            <h2>Inventory Analysis Report</h2>
        </div>
        </div>
    </div>
    <div class="row text-center">
        <div class="services-contents">
            <br><br>
            <div class="col-md-8 col-sm-8 col-xs-12">
                <div class="tab-menu">    
                    <ul class="nav nav-tabs" role="tablist">
                    <li class="active">
                        <a href="#pa-view-1" role="tab" data-toggle="tab">Demand</a>
                    </li>
                    <li>
                        <a href="#pa-view-2" role="tab" data-toggle="tab">Lead time</a>
                    </li>
                    <li>
                        <a href="#pa-view-3" role="tab" data-toggle="tab">Inventory</a>
                    </li>
                    </ul>
                </div>
                <div class="tab-content">
                    <div class="tab-pane active" id="pa-view-1">
                    <div class="tab-inner">
                            <br><br>
                            <table class="table table-striped">
                                <thead>
                                  <tr style="font-weight: bold;">
                                    <td>Demand</td>
                                    ${demand_frequency.length > 0 ? '<td>Frequency</td>' : ''}
                                    <td>Probality</td>
                                    <td>Cumulative</td>
                                    <td>Interval</td>
                                  </tr>
                                </thead>
                                <tbody>
                                ${Object.keys(inventory_demand).map(function (key) {
                                    if(demand_frequency.length > 0 ){
                                        return "<tr><td>" + inventory_demand[key] + "</td><td>"+demand_frequency[key]+"</td><td>"+demand_pdf[key].toFixed(2)+"</td><td>"+demand_cdf[key]+"</td><td>"+ demand_intervals[key][0] +" to "+demand_intervals[key][1]+"</td></tr>"           
                                    }else{
                                        return "<tr><td>" + inventory_demand[key] + "</td><td>"+demand_pdf[key].toFixed(2)+"</td><td>"+demand_cdf[key]+"</td><td>"+ demand_intervals[key][0] +" to "+demand_intervals[key][1]+"</td></tr>" 
                                    }

                                }).join("")}
                                </tbody>
                            </table>
                    </div>
                    </div>
                    <div class="tab-pane" id="pa-view-2">
                    <div class="tab-inner">
                        <br><br>
                        <table class="table table-striped">
                            <thead>
                                <tr style="font-weight: bold;">
                                    <td>Lead Time</td>
                                    ${leadtime_frequency.length > 0 ? '<td>Frequency</td>' : ''}
                                    <td>Probality</td>
                                    <td>Cumulative</td>
                                    <td>Interval</td>
                                </tr>
                            </thead>
                            <tbody>
                            ${Object.keys(leadtime).map(function (key) {
                                if(leadtime_frequency.length > 0 ){
                                    return "<tr><td>" + leadtime[key] + "</td><td>"+leadtime_frequency[key]+"</td><td>"+leadtime_pdf[key].toFixed(2)+"</td><td>"+leadtime_cdf[key]+"</td><td>"+ leadtime_intervals[key][0] +" to "+leadtime_intervals[key][1]+"</td></tr>"           
                                }else{
                                    return "<tr><td>" + leadtime[key] + "</td><td>"+leadtime_pdf[key].toFixed(2)+"</td><td>"+leadtime_cdf[key]+"</td><td>"+ leadtime_intervals[key][0] +" to "+leadtime_intervals[key][1]+"</td></tr>"
                                }
                            }).join("")}
                            </tbody>
                        </table>
                    </div>
                    </div>
                    <div class="tab-pane" id="pa-view-3">
                    <div class="tab-inner">
                        <br><br>
                        <table class="table table-striped">
                            <thead>
                                <tr style="font-weight: bold;">
                                    <td>Day</td>
                                    <td>Recieved</td>
                                    <td>Begin Inventory</td>
                                    <td>Demand RN</td>
                                    <td>Demand</td>
                                    <td>End Inventory</td>
                                    <td>Lost Sale</td>
                                    <td>Order</td>
                                    <td>Lead Time RN</td>
                                    <td>Lead Time</td>
                                </tr>
                            </thead>
                            <tbody>
                            ${Object.keys(recieved).map(function (key) {
                                let day = parseInt(key)+1
                                return "<tr><td>" + day + "</td><td>"+recieved[key]+"</td><td>"+begin_inv[key]+"</td><td>"+demand_rands[key]+"</td><td>"+simulate_demand[key]+"</td><td>"+end_inv[key]+"</td><td>"+lost_sale[key]+"</td><td>"+order_state[key]+"</td><td>"+lead_rands[key]+"</td><td>"+simulate_lead[key]+"</td></tr>"           
                            }).join("")}
                            </tbody>
                        </table>
                    </div>
                    </div>
                </div>
            </div>      
            <div class="col-md-4 col-sm-4 col-xs-12">
                <br><br>
            <div class="faq-details">
                <div class="panel-group" id="accordion1">
              
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" class="active" data-parent="#accordion1" href="#acheck1">
                            <span class="acc-icons"></span>Average Ending Inventory
                        </a>
                    </h4>
                    </div>
                    <div id="acheck1" class="panel-collapse collapse in">
                    <div class="panel-body">
                        <p>${Math.round(endinv_sum/simulate_count * 100) /100}</p>
                    </div>
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" data-parent="#accordion1" href="#acheck2">
                            <span class="acc-icons"></span> Average Lost Sales
                        </a>
                    </h4>
                    </div>
                    <div id="acheck2" class="panel-collapse collapse">
                    <div class="panel-body">
                        <p>${Math.round(lost_sum/simulate_count * 100) / 100}</p>
                    </div>
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" data-parent="#accordion1" href="#acheck3">
                            <span class="acc-icons"></span> Average Number Of orders
                        </a>
                    </h4>
                    </div>
                    <div id="acheck3" class="panel-collapse collapse">
                    <div class="panel-body">
                        <p>${Math.round(order_count/simulate_count * 100) / 100}</p>
                    </div>
                    </div>
                </div>
                
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" data-parent="#accordion1" href="#acheck4">
                            <span class="acc-icons"></span> Daily Order Cost
                        </a>
                    </h4>
                    </div>
                    <div id="acheck4" class="panel-collapse collapse">
                    <div class="panel-body">
                        <p>$${Math.round(order_count/simulate_count * parseFloat(document.getElementById('order-cost').value) * 100) / 100 }</p>
                    </div>
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" data-parent="#accordion1" href="#acheck5">
                            <span class="acc-icons"></span> Daily Holding Cost
                        </a>
                    </h4>
                    </div>
                    <div id="acheck5" class="panel-collapse collapse">
                    <div class="panel-body">
                        <p>$${Math.round((endinv_sum/simulate_count * parseFloat(document.getElementById('hold-cost').value) / yearDays) * 100 ) / 100 }</p>
                    </div>
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" data-parent="#accordion1" href="#acheck6">
                            <span class="acc-icons"></span> Daily Stockout Cost
                        </a>
                    </h4>
                    </div>
                    <div id="acheck6" class="panel-collapse collapse">
                    <div class="panel-body">
                        <p>$${Math.round(lost_sum/simulate_count * parseInt(document.getElementById('lost-cost').value) * 100) / 100}</p>
                    </div>
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading">
                    <h4 class="check-title">
                        <a data-toggle="collapse" data-parent="#accordion1" href="#acheck7">
                            <span class="acc-icons"></span> Total Daily Inventory Cost
                        </a>
                    </h4>
                    </div>
                    <div id="acheck7" class="panel-collapse collapse">
                    <div class="panel-body">
                        <p>$${
                            (Math.round(order_count/simulate_count * parseFloat(document.getElementById('order-cost').value) * 100) / 100) 
                            + (Math.round((endinv_sum/simulate_count * parseFloat(document.getElementById('hold-cost').value) / yearDays) * 100 ) / 100)
                        +(Math.round(lost_sum/simulate_count * parseInt(document.getElementById('lost-cost').value) * 100) / 100) }</p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    </div>
    ` 
}

