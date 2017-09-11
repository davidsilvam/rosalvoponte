var hostweburl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));
var appweburl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));
var carrinhoProdutosArray = new Array();
var infoProdutosArray = new Array();
var infoBriefingArray = new Array();
var briefingSelect = 0;
var errorAddProduct = 0;
var numObs = 0;

$(document).ready(function () {
    ExecuteOrDelayUntilScriptLoaded(ddlPopulateBriefing, 'sp.js');
});

/*
    Get URL's'
 */
function getQueryStringParameter(paramToRetrieve) {
    var params = document.URL.split("?")[1].split("&");
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] === paramToRetrieve) return singleParam[1];
    }
}

/*
    Routine to insert item in list SharePoint
*/

function convertDateFormat(date) {
    var day = "";
    var month = "";
    var year = "";
    var flag;
    if (date[2] === '/' && date[5] === '/') {
        flag = 0;
    }
    else if (date[1] === '/' && date[3] === '/') {
        flag = 1;
    }
    else if (date[1] === '/') {
        flag = 2;
    }
    if (flag === 0) {
        day = parseInt(date[0] + date[1]);
        month = date[3] + date[4];
        year = date[6] + date[7] + date[8] + date[9];
    }
    else if (flag === 1) {
        day = 0 + parseInt(date[0]);
        month = 0 + parseInt(date[2]);
        year = date[4] + date[5] + date[6] + date[7];
    }
    else if (flag === 2) {
        day = 0 + parseInt(date[0]);
        month = date[2] + date[3];
        year = date[5] + date[6] + date[7] + date[8];
    }
    else {
        day = parseInt(date[0] + date[1]);
        month = 0 + parseInt(date[3]);
        year = date[5] + date[6] + date[7] + date[8];
    }
    return month + '/' + day + '/' + year +' 8:00:00';
}

/* ==============================================================DEBUG/\ CODIGO \/========================================================== */
/*

/*
   ddlPopulateBriefing() - Get na lista Briefing e adiciona seus itens com opção de seleção
    Entrada: Nome da lista(String), Condições de seleção tipo cam(String), Include colunas(String)
    Saída: Itens como opção da caixa de seleção

    ddlPopulateBriefingSucceeded(sender, args) - Sucesso no Get dos itens
    Entrada: Objeto corrente, Id da tag select(String),  Array com nome das colunas acompanhado de um bit para caso de lookupValue(String), Nome da lista do grupo de produtos(String), Array para armazenar(Array)
    Saída: Caixa de seleção populada com os itens das colunas e armazenadas em um array

    ddlPopulateBriefingFailed(sender, args) - Falha na requisição dos itens da lista
    Entrada: Objeto corrente
    Saída:  Notificação da falha durante a notificação
 */

function ddlPopulateBriefing() {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    var oList = siteContext.get_web().get_lists().getByTitle('Briefing');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Number\'>1</Value></Geq></Where></Query></View>');
    this.collListItem = oList.getItems(camlQuery);
    try {
        clientContext.load(collListItem, 'Include(Cliente, Id,DTEVENTO,Buffet,Produtor_x0028_a_x0029_)');//Alteração
    } catch (err) {
        console.log('Deu bode ' + err);
    }
    clientContext.executeQueryAsync(Function.createDelegate(this, this.ddlPopulateBriefingSucceeded), Function.createDelegate(this, this.ddlPopulateBriefingFailed));
}

function ddlPopulateBriefingSucceeded(sender, args) {
    var ddlBriefing = this.document.getElementById('ddlBriefing');
    ddlBriefing.options.length = 0;
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        var produtorJSON = JSON.stringify(oListItem.get_item('Produtor_x0028_a_x0029_'));
        ddlBriefing.options[ddlBriefing.options.length] = new Option(oListItem.get_item('Cliente').get_lookupValue(), oListItem.get_id());
        if (produtorJSON !== 'null'){
            infoBriefingArray.push([oListItem.get_item('Cliente').get_lookupValue(), oListItem.get_item('DTEVENTO'), oListItem.get_item('Buffet'), produtorJSON]);//Alteração
            //console.log(oListItem.get_item('Cliente').get_lookupValue() + '-' + produtorJSON);
        }
        else{
            infoBriefingArray.push([oListItem.get_item('Cliente').get_lookupValue(), oListItem.get_item('DTEVENTO'), oListItem.get_item('Buffet'), '{"$1k_1":4,"$5O_1":"Não especificado"}']);//Alteração
        }        
        //console.log(oListItem.get_item('Cliente').get_lookupValue() + '-' + produtorJSON);
    }
} 

function ddlPopulateBriefingFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}


function getItensProducaoEvento(evento) {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    var oList = siteContext.get_web().get_lists().getByTitle('Saída de Itens do ESTOQUE para PRODUÇÃO');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'orcamento\'/><Value Type=\'Text\'>' + evento + '</Value></Eq></Where></Query></View>');
    //'<View><Query><Where><Eq><FieldRef Name=\'orcamento\'/><Value Type=\'Text\'>' + 'CLIENTE_TESTE' +'</Value></Eq></Where></Query></View>'
    this.collListItem = oList.getItems(camlQuery);
    try {
        clientContext.load(collListItem);
    } catch (err) {
        console.log('Deu bode' + err);
    }
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededProducaoEvento), Function.createDelegate(this, this.onQueryFailedProducaoEvento));
}

function onQuerySucceededProducaoEvento(sender, args) {
    var listItemInfo = '';
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        var orcamentoJSON = JSON.stringify(oListItem.get_item('orcamento'));
        var produtoJSON = JSON.stringify(oListItem.get_item('Produto'));
        var codigoJSON = JSON.stringify(oListItem.get_item('Produto_x003a_Codigo'));
        var enderecoJSON = JSON.stringify(oListItem.get_item('Produto_x003a_Endere_x00e7_ament'));
        //console.log(enderecoJSON);
        if (orcamentoJSON !== 'null' && produtoJSON !== 'null' && enderecoJSON !== 'null') {
            addNewProduct(document.getElementById('ddlBriefing').value, produtoJSON, oListItem.get_item('Quantidade0'), oListItem.get_item('dtsaidaorcamento'), oListItem.get_item('Title'), 1, oListItem.get_id(), codigoJSON, enderecoJSON);
        }        
    }
}

function onQueryFailedProducaoEvento(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

function choiceBriefing(sele) {
    var dataHoraE = separateDataHoraOnBriefing(getDataHoraEventoOnBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text));
    //var localE = getLocalEventoBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    var localE = JSON.stringify(getLocalEventoBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text));
    var produtorE = getProdutorOnBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    //var localE = JSON.parse(localE)['$5O_1'];
    //alert(JSON.parse(localE)['$5O_1']);
    $("#tablePrint").empty();
    $("#tablePrintB").empty();
    if (localE !== "null") {
        masterDetailHeader(dataHoraE.dataE, dataHoraE.horaE, JSON.parse(localE)[Object.keys(JSON.parse(localE))[1]], JSON.parse(produtorE)[Object.keys(JSON.parse(produtorE))[1]]);       
        getItensProducaoEvento(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    }
    else {
        masterDetailHeader(dataHoraE.dataE, dataHoraE.horaE, "Não especificado", JSON.parse(produtorE)[Object.keys(JSON.parse(produtorE))[1]]);
        getItensProducaoEvento(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    }
    if (document.getElementById('ddlBriefing').options < 0) {
        alert("Nenhum evento selecionado!");
    }
    else {
        //alert(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
        //alert(document.getElementById('ddlBriefing').selectedIndex);
        //alert(document.getElementById('ddlBriefing').value);
    }
    $(".below-bar").show();    
}


function getCodigoOnProduct(productText) {
    for (var i = 0; i < infoProdutosArray.length; i++) {
        if (infoProdutosArray[i][0] === productText) {
            return infoProdutosArray[i][2];
        }
    }
}

//Corrigir
function getProdutorOnBriefing(productText) {
    for (var i = 0; i < infoBriefingArray.length; i++) {
        //console.log(infoBriefingArray[i][0] + ' - ' + productText);
        if (infoBriefingArray[i][0] === productText) {
            //console.log(infoBriefingArray[i][0] + ' - ' + productText);
            //console.log(infoBriefingArray[i][3]);
            //console.log(JSON.parse(infoBriefingArray[i][3])["$5O_1"]);
            return infoBriefingArray[i][3];
        }
    }
    //return "Não especificado";
}

function getQuantidadeEstoqueOnProduct(productText) {
    for (var i = 0; i < infoProdutosArray.length; i++) {
        //console.log('nome' + infoProdutosArray[i][0] + 'estoque' + infoProdutosArray[i][3]);
        if (infoProdutosArray[i][0] === productText) {
            //alert(infoProdutosArray[i][3]);
            return infoProdutosArray[i][3];
        }
    }
    return 0;
}

/*
 * Novas funções
 */
function getDataHoraEventoOnBriefing(productText) {
    for (var i = 0; i < infoBriefingArray.length; i++) {
        if (infoBriefingArray[i][0] === productText) {
            //alert(infoBriefingArray[i][1]);
            return infoBriefingArray[i][1];
        }
    }
}

function getLocalEventoBriefing(productText) {
    for (var i = 0; i < infoBriefingArray.length; i++) {
        if (infoBriefingArray[i][0] === productText) {
            //alert(infoBriefingArray[i][2]);
            return infoBriefingArray[i][2];
        }
    }
}

function separateDataHoraOnBriefing(dataHoraBriefing) {
    var date = new Date(dataHoraBriefing);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    //alert(day + '/' + month + '/' + year);
    //alert(hour + ':' + minutes);
    if (hour !== 0) {
        hour = hour - 1;
    }
    if (hour < 10 && minutes < 10){
        return { dataE: day + '/' + month + '/' + year, horaE: '0' + hour + ':' + '0' + minutes };
    }
    else if (hour < 10) {
        return { dataE: day + '/' + month + '/' + year, horaE: '0' + hour + ':' + minutes };
    }
    else if (minutes < 10){
        return { dataE: day + '/' + month + '/' + year, horaE: hour + ':' + '0' + minutes };
    }
    else {
        return { dataE: day + '/' + month + '/' + year, horaE: hour + ':' + minutes };
    }
}

function addNewProduct() {
    var tableRef = document.getElementById('tablePrintB');
    var lastRow = tableRef.rows.length;
    var newRow = tableRef.insertRow(lastRow);//lastRow - 1
    if (arguments.length > 0) {
        var idEvento = arguments[0];
        var idProduto = arguments[1];
        var qtd = arguments[2];
        var dta = arguments[3];
        var obs = arguments[4];
        var duty = arguments[5];
        var idClienteProdutoUpdate = arguments[6];
        var codProd = arguments[7];
        var end = arguments[8];
        //alert(convertDateFormat(separateDataHoraOnBriefing(dta).dataE));
        //alert(idProduto + ' ' + JSON.parse(idProduto)["$1k_1"]);
        carrinhoProdutosArray.push([parseInt(idEvento), String(JSON.parse(idProduto)[Object.keys(JSON.parse(idProduto))[0]]), parseInt(qtd), convertDateFormat(separateDataHoraOnBriefing(dta).dataE), obs, duty, idClienteProdutoUpdate]);
        console.log(carrinhoProdutosArray);
        newCell = newRow.insertCell(0);
        newCell.innerHTML = JSON.parse(codProd)[Object.keys(JSON.parse(codProd))[1]];//getCodigoOnProduct(JSON.parse(idProduto)["$5O_1"]);//nome produtoobs: Não tem o vetor
        newCell = newRow.insertCell(1);
        newCell.innerHTML = JSON.parse(idProduto)[Object.keys(JSON.parse(idProduto))[1]];//nome produto
        newCell = newRow.insertCell(2);
        newCell.style = 'text-align: center;';
        newCell.innerHTML = qtd;//qtd
        newCell = newRow.insertCell(3);
        if (obs !== null){
            newCell.innerHTML = obs;//obs
        }
        else {
            newCell.innerHTML = '';//obs
        }       
        newCell = newRow.insertCell(4);
        //alert(JSON.parse(end)["$5O_1"]);
        if (JSON.parse(end)[Object.keys(JSON.parse(idProduto))[1]] !== 'null' && JSON.parse(end)[Object.keys(JSON.parse(idProduto))[1]] !== null){
            newCell.innerHTML = JSON.parse(end)[Object.keys(JSON.parse(end))[1]];
        }
        else {
            newCell.innerHTML = 'Local não definido';
        }
        //newCell.innerHTML = JSON.parse(end)["$5O_1"];
        numObs = numObs + 1;
        newCell.colSpan = 3;
        newRow.appendChild(newCell);
    }
    else {
        //args = arguments.length > 0 ? arguments : null;
        if ($("#myDateField_1").val() !== '' && document.getElementById('txtAcrescimo').value !== '0' && briefingSelect !== 0) {
            if (existsInCarrinhoProdutosArray(document.getElementById('ddlProduto').value)) {
                updateCarrinhoProdutosArray(document.getElementById('ddlProduto').value);
                atualizarTabela($("#ddlProduto :selected").text());
            }
            else {        
                //existsInCarrinhoProdutosArray(document.getElementById('ddlProduto').value);
                carrinhoProdutosArray.push([document.getElementById('ddlBriefing').value, document.getElementById('ddlProduto').value, document.getElementById('txtAcrescimo').value, convertDateFormat($('#myDateField_1').val()), 'Nenhuma Observação', 0,-1]);
                console.log(carrinhoProdutosArray);
                newCell = newRow.insertCell(0);
                newCell.innerHTML = getCodigoOnProduct($("#ddlProduto :selected").text());
                newCell = newRow.insertCell(1);
                newCell.innerHTML = $("#ddlProduto :selected").text();
                newCell = newRow.insertCell(2);
                newCell.style = 'text-align:center;';
                newCell.innerHTML = document.getElementById('txtAcrescimo').value;                
                newCell = newRow.insertCell(3);
                //newCell = newRow.insertCell(4);
                newCell.innerHTML = '<input type="text" size=40 maxlength="255" id="obs' + numObs + '"></input>';
                numObs = numObs + 1;
                newCell.colSpan = 3;
                newRow.appendChild(newCell);
            }
        }
        else if (briefingSelect === 0) {
            //alert('Você deve escolher um evento e clicar em confirmar para adicionar produtos.');
            $('#briefingError').show();
        } else if (document.getElementById('txtAcrescimo').value === '0') {
            alert('A quantidade deve ser maior que zero.');
        }
        else {
            //alert('Você deve selecionar uma data de saída antes de adicionar um produto.');
            $('#dtaError').show();
        }
    }
}

function inicializeTable() {
    var tableRef = document.getElementById('tablePrintB');
    var newRow = tableRef.insertRow(-1);
    var newCell = newRow.insertCell(0);
    newCell.innerHTML = 'Código';
    newCell = newRow.insertCell(1);
    newCell.innerHTML = 'Descrição';
    newCell = newRow.insertCell(2);
    newCell.innerHTML = 'Quantidade';
    newCell = newRow.insertCell(3);
    newCell.innerHTML = 'Observação';
    newCell = newRow.insertCell(4);
    newCell.innerHTML = 'Localização';
}



function masterDetailHeader(dataEvento,horaEvento,localEvento,produtorEvento) {
    // Get a reference to the table
    var tableRef = document.getElementById('tablePrint');
    //var lastRow = tableRef.rows.length;
    //var lastCol = tableRef.rows.length;

    // Insert a row in the table at row index 0
    var newRow = tableRef.insertRow(-1);
    // Insert a cell in the row at index 0
    var newCell = newRow.insertCell(0);

    newCell.style = 'width: auto; color: red; border:none;';
    newCell.innerHTML = 'Descrição da festa: ';
    newRow.appendChild(newCell);


    newCell = newRow.insertCell(1);
    newCell.style = 'width: auto; color: red; min-width:auto; text-align:left;border:none;';
    newCell.innerHTML = document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text;

    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.style = 'width: auto; color: red; text-align: left;border:none;';
    newCell.innerHTML = 'Data: ';

    newCell = newRow.insertCell(1);
    newCell.style = 'border:none;';
    newCell.innerHTML = dataEvento;

    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.style = 'text-align: left;border:none;';
    newCell.innerHTML = 'Hora: ';
    newCell = newRow.insertCell(1);
    newCell.style = 'text-align: left;border:none;';
    newCell.innerHTML = horaEvento;


    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.style = 'text-align: left;border:none;';
    newCell.innerHTML = 'Local: ';
    newCell = newRow.insertCell(1);
    newCell.style = 'text-align: left;border:none;';
    newCell.innerHTML = localEvento;

    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.style = 'text-align: left;border:none;';
    newCell.innerHTML = 'Produtor(a): ';
    newCell = newRow.insertCell(1);
    newCell.style = 'text-align: left;border:none;';
    newCell.innerHTML = String(produtorEvento);
    inicializeTable();
}

/*=======================================================\/GERAR RELATÓRIO\/==============================================================*/

function genPDF() {

    var doc = new jsPDF('l', 'pt');

    var res = doc.autoTableHtmlToJson(document.getElementById("tablePrint"));
    doc.autoTable(res.columns, res.data, { theme: 'plain', columnStyles: { 0: { columnWidth: 105 }, 1: { columnWidth: 400 } }
});

    res = doc.autoTableHtmlToJson(document.getElementById("tablePrintB"));
    doc.autoTable(res.columns, res.data, {
    theme: 'plain', startY: doc.autoTableEndPosY() + 20, styles: { overflow: 'linebreak' }, columnStyles: {
        0: { columnWidth: 50 },
        1: { columnWidth: 200 },
        2: { columnWidth: 70 },
        3: { columnWidth: 300 },
        4: { columnWidth: 150 }
        // etc
    }
});

    doc.save(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text + ".pdf");
}
//document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text;

/*function tableToJson(table) {
    var data = [];

    // first row needs to be headers
    var headers = [];
    for (var i = 0; i < table.rows[0].cells.length; i++) {
        headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi, '');
    }

    // go through cells
    for (var i = 1; i < table.rows.length; i++) {

        var tableRow = table.rows[i];
        var rowData = {};

        for (var j = 0; j < tableRow.cells.length; j++) {

            rowData[headers[j]] = tableRow.cells[j].innerHTML;

        }

        data.push(rowData);
    }

    return data;
}*/

function teste(){

    var table1 =
        tableToJson($('#tablePrint').get(0)),
        cellWidth = 35,
        rowCount = 0,
        cellContents,
        leftMargin = 2,
        topMargin = 12,
        topMarginTable = 55,
        headerRowHeight = 13,
        rowHeight = 9,

        l = {
            orientation: 'l',
            unit: 'mm',
            format: 'a3',
            compress: true,
            fontSize: 8,
            lineHeight: 1,
            autoSize: false,
            printHeaders: true
        };

    var doc = new jsPDF(l, '', '', '');

    doc.setProperties({
        title: 'Test PDF Document',
        subject: 'This is the subject',
        author: 'author',
        keywords: 'generated, javascript, web 2.0, ajax',
        creator: 'author'
    });

    doc.cellInitialize();

    $.each(table1, function (i, row) {

        rowCount++;

        $.each(row, function (j, cellContent) {

            if (rowCount === 1) {
                doc.margins = 1;
                doc.setFont("helvetica");
                doc.setFontType("bold");
                doc.setFontSize(9);

                doc.cell(leftMargin, topMargin, cellWidth, headerRowHeight, cellContent, i)
            }
            else if (rowCount === 2) {
                doc.margins = 1;
                doc.setFont("times ");
                doc.setFontType("italic");  // or for normal font type use ------ doc.setFontType("normal");
                doc.setFontSize(8);

                doc.cell(leftMargin, topMargin, cellWidth, rowHeight, cellContent, i);
            }
            else {

                doc.margins = 1;
                doc.setFont("courier ");
                doc.setFontType("bolditalic ");
                doc.setFontSize(6.5);

                doc.cell(leftMargin, topMargin, cellWidth, rowHeight, cellContent, i);  // 1st=left margin    2nd parameter=top margin,     3rd=row cell width      4th=Row height
            }
        })
    })

    doc.save('sample Report.pdf');
}