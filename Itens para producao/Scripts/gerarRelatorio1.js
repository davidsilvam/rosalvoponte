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
    return month + '/' + day + '/' + year + ' 8:00:00';
}

/* ==============================================================DEBUG/\ CODIGO \/========================================================== */
/*
    createListItem() - Adicionar um item do mestre detalhe na lista Saída de Itens do ESTOQUE para PRODUÇÃO
    Entrada: Nome da lista(String), Id do Cliente(Int), Id do Produto(Int), Quantidade do produto(Int), Observação(String)
    Saída: Parâmetros adicionados na lista
    
    onQuerySucceededCreate() - Sucesso na criação de um novo item
    Entrada: Objeto corrente
    Saída: Id do item criado

    onQueryFailedCreate(sender, args) - Falha na criação de um novo item
    Entrada: Objeto corrente
    Saída: Mensagem de erro da falha da criação de um novo item
    
 */

function createListItem(listaAdd, clienteID, produtoID, qtdProduto, dataSaida, observacao) {
    var clientContext = new SP.ClientContext(appweburl);
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);
    var lkfieldsomthing = new SP.FieldLookupValue();//Alteração
    var lkfieldsomthing2 = new SP.FieldLookupValue();//Alteração
    var oList = siteContext.get_web().get_lists().getByTitle(listaAdd);//'Saída de Itens do ESTOQUE para PRODUÇÃO'

    var itemCreateInfo = new SP.ListItemCreationInformation();
    this.oListItem = oList.addItem(itemCreateInfo);

    lkfieldsomthing.set_lookupId(clienteID);//1009
    lkfieldsomthing2.set_lookupId(produtoID);//1665
    console.log(lkfieldsomthing.set_lookupId(clienteID), lkfieldsomthing2.set_lookupId(produtoID));
    //oListItem.set_item('dtsaidaorcamento', valueName);
    //    oListItem.set_item('dtsaidaorcamento',);
    oListItem.set_item('Title', observacao);
    oListItem.set_item('dtsaidaorcamento', dataSaida);
    oListItem.set_item('Quantidade0', qtdProduto);
    oListItem.set_item('Tipo_x0020_de_x0020_movimenta_x0', 'TESTE_5');
    oListItem.set_item('orcamento', lkfieldsomthing);
    oListItem.set_item('Produto', lkfieldsomthing2);

    oListItem.update();

    clientContext.load(oListItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededCreate), Function.createDelegate(this, this.onQueryFailedCreate));
}

function onQuerySucceededCreate() {
    console.log('Item created: ' + oListItem.get_id());
}

function onQueryFailedCreate(sender, args) {
    console.log('Request Failed' + args.get_message() + '\n' + args.get_stackTrace());
    errorAddProduct = 1;
}

/*
   updateListItem(listName,id,quant,obs) - Atualiza itens de uma lista('Saída de Itens do ESTOQUE para PRODUÇÃO')
    Entrada: Nome da lista(string), id(inteiro), quantidade(inteiro) e observação(string)
    Saída: 1, se a atualização ocorreu sem erros, 0, se ocorreu com erros e atualiza a lista
    
    onQuerySucceededUpdate() - Sucesso ao atualizar a lista
    Entrada: Objeto corrente
    Saída: 1, se a atualização aconteceu

    onQueryFailedUpdate(sender, args) - Falha ao atualizar a lista
    Entrada: Objeto corrente
    Saída: 0, caso tenha havido algum problema ao atualizar a lista
 */

function updateListItem(listName, id, quant, obs) {
    var clientContext = new SP.ClientContext(appweburl);
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);
    var oList = siteContext.get_web().get_lists().getByTitle(listName);
    this.oListItem = oList.getItemById(id);

    oListItem.set_item('Quantidade0', quant);
    oListItem.set_item('Title', obs);

    oListItem.update();

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededUpdate), Function.createDelegate(this, this.onQueryFailedUpdate));
}

function onQuerySucceededUpdate() {
    //alert('Item updated!');
    console.log('Item updated!');
    return 0;
}

function onQueryFailedUpdate(sender, args) {
    //alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    console.log('Request update failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    return 1;
}

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
        clientContext.load(collListItem, 'Include(Cliente, Id,DTEVENTO,Buffet)');//Alteração
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
        ddlBriefing.options[ddlBriefing.options.length] = new Option(oListItem.get_item('Cliente').get_lookupValue(), oListItem.get_id());
        infoBriefingArray.push([oListItem.get_item('Cliente').get_lookupValue(), oListItem.get_item('DTEVENTO'), oListItem.get_item('Buffet')]);//Alteração
    }
    ExecuteOrDelayUntilScriptLoaded(ddlPopulateGrupo, 'sp.js');
}

function ddlPopulateBriefingFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*
    ddlPopulateGrupo() - Get na lista grupo e adiciona seus itens como opção de seleção
    Entrada: Nome da lista(String), Condições de seleção tipo cam(String), Include colunas(String)
    Saída: Itens como opção da caixa de seleção

    ddlPopulateGrupoSucceeded(sender, args) - Sucesso no get dos itens
    Entrada: 
 */
function ddlPopulateGrupo() {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    var oList = siteContext.get_web().get_lists().getByTitle('Grupos de Produtos');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Number\'>1</Value></Geq></Where><OrderBy><FieldRef Name="Title" Ascending="True" /></OrderBy></Query></View>');
    this.collListItem = oList.getItems(camlQuery);
    try {
        clientContext.load(collListItem, 'Include(Title, C_x00f3_digo)');
    } catch (err) {
        console.log('Deu bode ' + err);
    }
    clientContext.executeQueryAsync(Function.createDelegate(this, this.ddlPopulateGrupoSucceeded), Function.createDelegate(this, this.ddlPopulateGrupoFailed));
}

function ddlPopulateGrupoSucceeded(sender, args) {
    var ddlGrupo = this.document.getElementById('ddlGrupo');
    ddlGrupo.options.length = 0;
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        ddlGrupo.options[ddlGrupo.options.length] = new Option(oListItem.get_item('Title'), oListItem.get_item('C_x00f3_digo'));
    }
    //$('#ddlGrupo').find('option:first').attr('selected', 'selected');
    //    ExecuteOrDelayUntilScriptLoaded(ddlPopulateProduto, 'sp.js');
}

function ddlPopulateGrupoFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*
 *  Função de teste
 */
function myFunction() {
    var x = document.getElementById("ddlGrupo").selectedIndex;
    var y = document.getElementById("ddlGrupo").options;
    var value = document.getElementById("ddlGrupo").value;
    var split = value.split(",");
    var v1 = split[0];
    var v2 = split[1];
    //alert("Index: " + y[x].index + " is " + y[x].text + "value:" + value);
    //alert("firstValue: " + v1 + ", secondValue: " + v2);
    console.log(carrinhoProdutosArray);
}

/*
 *  Função que dará get na lista de saída de itens do estoque para produção 
 */

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
        if (orcamentoJSON !== 'null' && produtoJSON !== 'null') {
            addNewProduct(document.getElementById('ddlBriefing').value, produtoJSON, oListItem.get_item('Quantidade0'), oListItem.get_item('dtsaidaorcamento'), oListItem.get_item('Title'), 1, oListItem.get_id(), codigoJSON);
        }
    }
}

function onQueryFailedProducaoEvento(sender, args) {
    myDiv1.innerHTML = 'Request failed. ' + args.get_message() + '\n' + args.get_stackTrace();
}

function choiceBriefing(sele) {
    var dataHoraE = separateDataHoraOnBriefing(getDataHoraEventoOnBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text));
    //var localE = getLocalEventoBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    var localE = JSON.stringify(getLocalEventoBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text));
    //var localE = JSON.parse(localE)['$5O_1'];
    //alert(JSON.parse(localE)['$5O_1']);
    if (localE !== 'null') {
        masterDetailHeader(dataHoraE.dataE, dataHoraE.horaE, JSON.parse(localE)['$5O_1']);
        getItensProducaoEvento(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    }
    else {
        masterDetailHeader(dataHoraE.dataE, dataHoraE.horaE, "Local não definido");
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
    briefingSelect = 1;
    //$('#briefingChoice').click(false);
    document.getElementById("briefingChoice").disabled = true;
    //alert($("#myDateField_1").val());
    //console.log($("#myDateField_1").text);

}
/*
    Select Group
 */
function choice(select) {
    //alert(select.options[select.selectedIndex].value);
    //Passar mesmo argumento para a função de busca do link da imagem
    ExecuteOrDelayUntilScriptLoaded(function () { ddlPopulateProduto(select.options[select.selectedIndex].value); }, 'sp.js');
    $("#txtAcrescimo").val(0);
    //$('#ddlProduto').find('option:first').attr('selected', 'selected');
    //$('#ddlProduto').click();
}

function choiceImage(imgSelect) {
    //alert(document.getElementById('ddlProduto').value);
    console.log(getImageOnProduct(imgSelect.options[imgSelect.selectedIndex].text));
    //getImageOnProduct(imgSelect.options[imgSelect.selectedIndex].text);
}
/*
    Routine to find element in array
 */

function getImageOnProduct(productText) {
    for (var i = 0; i < infoProdutosArray.length; i++) {

        if (infoProdutosArray[i][0] === productText) {
            //alert(infoProdutosArray[i][0]);
            $("#imgPreview").attr("src", infoProdutosArray[i][1]);
            //console.log(infoProdutosArray[i][3]);
            if (infoProdutosArray[i][3] !== null) {//verificar se esse retorno é null mesmo
                $("#qtdEstoque").text('Em estoque: ' + infoProdutosArray[i][3]);
            }
            else {
                $("#qtdEstoque").text('Em estoque: ' + '0');
            }
            $('#qtdEstoque').show();
            return infoProdutosArray[i][1];
        }
    }
    //$("#imgPreview").attr("src", "https://rosalvoponte.sharepoint.com/sites/sgs/sge/Catlogo%20de%20Produtos/Produto%20sem%20imagem.jpg");
    //$("#qtdEstoque").text('Em estoque: ' + '0');
    //$('#qtdEstoque').show();
    //return "https://rosalvoponte.sharepoint.com/sites/sgs/sge/Catlogo%20de%20Produtos/Produto%20sem%20imagem.jpg";
}


function getCodigoOnProduct(productText) {
    for (var i = 0; i < infoProdutosArray.length; i++) {
        if (infoProdutosArray[i][0] === productText) {
            return infoProdutosArray[i][2];
        }
    }
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
    if (hour < 10 && minutes < 10) {
        return { dataE: day + '/' + month + '/' + year, horaE: '0' + hour + ':' + '0' + minutes };
    }
    else if (hour < 10) {
        return { dataE: day + '/' + month + '/' + year, horaE: '0' + hour + ':' + minutes };
    }
    else if (minutes < 10) {
        return { dataE: day + '/' + month + '/' + year, horaE: hour + ':' + '0' + minutes };
    }
    else {
        return { dataE: day + '/' + month + '/' + year, horaE: hour + ':' + minutes };
    }
}

/*
    Select produt to add
*/
function ddlPopulateProduto(filter) {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    console.log(clientContext + ' ' + siteContext);
    var oList = siteContext.get_web().get_lists().getByTitle('Produto');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><And><Geq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Number\'>1</Value></Geq><Eq><FieldRef Name=\'Grupo\'/><Value Type=\'Number\'>' + String(filter) + '</Value></Eq></And></Where><OrderBy><FieldRef Name="Title" Ascending="True" /></OrderBy></Query></View>');
    this.collListItem = oList.getItems(camlQuery);
    try {
        clientContext.load(collListItem, 'Include(Title, Endere_x00e7_o_x0020_da_x0020_Im,Codigo,Quantidade_x0020_em_x0020_estoqu,Id)');
    } catch (err) {
        console.log('Deu bode ' + err);
    }
    clientContext.executeQueryAsync(Function.createDelegate(this, this.ddlPopulateProductoSucceeded), Function.createDelegate(this, this.ddlPopulateProductoFailed));
}

function ddlPopulateProductoSucceeded(sender, args) {
    infoProdutosArray = [];
    var ddlProduto = this.document.getElementById('ddlProduto');
    ddlProduto.options.length = 0;
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        var jsonImg = JSON.stringify(oListItem.get_item('Endere_x00e7_o_x0020_da_x0020_Im'), null, 2);
        ddlProduto.options[ddlProduto.options.length] = new Option(oListItem.get_item('Title'), oListItem.get_id());
        if (jsonImg !== 'null') {
            infoProdutosArray.push([oListItem.get_item('Title'), JSON.parse(jsonImg)['$1_1'], oListItem.get_item('Codigo'), oListItem.get_item('Quantidade_x0020_em_x0020_estoqu')]);
        }
        else {
            infoProdutosArray.push([oListItem.get_item('Title'), "https://rosalvoponte.sharepoint.com/sites/sgs/sge/Catlogo%20de%20Produtos/Produto%20sem%20imagem.jpg", oListItem.get_item('Codigo'), oListItem.get_item('Quantidade_x0020_em_x0020_estoqu')]);
        }
    }
}

function ddlPopulateProductoFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}


/*
    Button quantity
*/

function initQuant() {
    //var qtdEstProd = getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text());
    //alert($("#ddlProduto :selected").text());
    //alert(getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text()));
    $("#txtAcrescimo").val(0);
    //document.getElementById('btnAddProduto').disabled = true;
    $("#aumentaAcrescimo").click(function () {
        var qtdEstProd = getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text());
        var input = $("#txtAcrescimo")[0];
        var acrescimo = parseInt(input.value, 10) + 1;
        input.value = acrescimo;
        document.getElementById('btnAddProduto').disabled = acrescimo > 0 && $("#txtAcrescimo").val() <= qtdEstProd ? false : true;
    });

    $("#diminuiAcrescimo").click(function () {
        var qtdEstProd = getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text());
        var input = $("#txtAcrescimo")[0];
        var decrescimo = parseInt(input.value, 10) - 1;
        input.value = decrescimo < 1 ? 0 : decrescimo;
        document.getElementById('btnAddProduto').disabled = decrescimo < 1 || $("#txtAcrescimo").val() > qtdEstProd ? true : false;
    });
}

function verifyQtd(quantidade) {
    //alert($("#ddlProduto :selected").text());
    var qtdEstProd = getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text());
    //alert(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    //alert($("#txtAcrescimo").val());
    if ($("#txtAcrescimo").val() === '0' || $("#txtAcrescimo").val() > qtdEstProd) {
        //alert('enrou');
        //$('btnAddProduto').click(false);
        document.getElementById('btnAddProduto').disabled = true;
    }
    else {
        //alert('mudou');
        //$('btnAddProduto').click(true);
        document.getElementById('btnAddProduto').disabled = false;
    }
}

function existsInCarrinhoProdutosArray(productCode) {
    for (var i = 0; i < carrinhoProdutosArray.length; i++) {
        //alert(typeof carrinhoProdutosArray[i][1] + typeof productCode);
        if (carrinhoProdutosArray[i][1] === productCode) {
            //$("#imgPreview").attr("src", infoProdutosArray[i][1]);
            //alert(carrinhoProdutosArray[i][1]);
            return true;
        }
    }
    return false;
}

function updateCarrinhoProdutosArray(productCode) {
    for (var i = 0; i < carrinhoProdutosArray.length; i++) {
        if (carrinhoProdutosArray[i][1] === productCode) {
            //$("#imgPreview").attr("src", infoProdutosArray[i][1]);
            //alert(carrinhoProdutosArray[i][1]);
            carrinhoProdutosArray[i][2] = parseInt(carrinhoProdutosArray[i][2]) + parseInt(document.getElementById('txtAcrescimo').value);
            //alert('havia: ' + carrinhoProdutosArray[i][2] + 'novo: ' + carrinhoProdutosArray[i][2] + document.getElementById('txtAcrescimo').value);
            //return true;
        }
    }
}

function atualizarTabela(productText) {
    var tableRef = document.getElementById('tablePrint');
    //alert(tableRef.rows[tableRef.rows.length-1].cells[0].innerHTML);
    for (var r = 4, n = tableRef.rows.length; r < n - 1; r++) {
        for (var c = 0, m = tableRef.rows[r].cells.length; c < m; c++) {
            //alert('row=' + r + 'cell=' + c);
            //createListItem('Saída de Itens do ESTOQUE para PRODUÇÃO', parseInt(carrinhoProdutosArray[0]), parseInt(carrinhoProdutosArray[1]));
            //console.log((tableRef.rows[r].cells[c].innerHTML));
            if (productText === tableRef.rows[r].cells[c].innerHTML) {
                // var a = tableRef.rows[r].cells[c].innerHTML;
                tableRef.rows[r].cells[c + 1].innerHTML = parseInt(tableRef.rows[r].cells[c + 1].innerHTML) + parseInt(document.getElementById('txtAcrescimo').value);
                //alert(tableRef.rows[r].cells[c].innerHTML);
            }
        }
    }
}


function addNewProduct() {
    var tableRef = document.getElementById('tablePrint');
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
        //alert(convertDateFormat(separateDataHoraOnBriefing(dta).dataE));
        //alert(idProduto + ' ' + JSON.parse(idProduto)["$1k_1"]);
        carrinhoProdutosArray.push([parseInt(idEvento), String(JSON.parse(idProduto)["$1k_1"]), parseInt(qtd), convertDateFormat(separateDataHoraOnBriefing(dta).dataE), obs, duty, idClienteProdutoUpdate]);
        console.log(carrinhoProdutosArray);
        newCell = newRow.insertCell(0);
        newCell.innerHTML = JSON.parse(codProd)["$5O_1"];//getCodigoOnProduct(JSON.parse(idProduto)["$5O_1"]);//nome produtoobs: Não tem o vetor
        newCell = newRow.insertCell(1);
        newCell.innerHTML = JSON.parse(idProduto)["$5O_1"];//nome produto
        newCell = newRow.insertCell(2);
        newCell.innerHTML = qtd;//qtd
        newCell = newRow.insertCell(3);
        //newCell = newRow.insertCell(4);
        if (obs !== null) {
            newCell.innerHTML = '<input type="text" size=40 maxlength="255"' + 'value="' + obs + '" id="obs' + numObs + '"></input>';//obs
        }
        else {
            newCell.innerHTML = '<input type="text" size=40 maxlength="255"' + 'value="" id="obs' + numObs + '"></input>';//obs
        }
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
                carrinhoProdutosArray.push([document.getElementById('ddlBriefing').value, document.getElementById('ddlProduto').value, document.getElementById('txtAcrescimo').value, convertDateFormat($('#myDateField_1').val()), 'Nenhuma Observação', 0, -1]);
                console.log(carrinhoProdutosArray);
                newCell = newRow.insertCell(0);
                newCell.innerHTML = getCodigoOnProduct($("#ddlProduto :selected").text());
                newCell = newRow.insertCell(1);
                newCell.innerHTML = $("#ddlProduto :selected").text();
                newCell = newRow.insertCell(2);
                newCell.innerHTML = document.getElementById('txtAcrescimo').value;
                newCell.style = 'text-align:center;';
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

function clearAllValues() {
    briefingSelect = 0;
    errorAddProduct = 0;
    numObs = 0;
    carrinhoProdutosArray = [];
    $('finalizarPedido').click(true);
    document.getElementById("briefingChoice").disabled = false;
    $("#tablePrint").empty();//Usar para limpar tudo
    $(".below-bar").hide();
    $('#myDateField_1').val('');
    $('#qtdEstoque').hide();
    $("#txtAcrescimo").val(0);
    $('#dtaError').hide();
    $('#briefingError').hide();
    //masterDetailHeader();
}

function masterDetailHeader(dataEvento, horaEvento, localEvento) {
    // Get a reference to the table
    var tableRef = document.getElementById('tablePrint');
    //var lastRow = tableRef.rows.length;
    //var lastCol = tableRef.rows.length;

    // Insert a row in the table at row index 0
    var newRow = tableRef.insertRow(-1);
    // Insert a cell in the row at index 0
    var newCell = newRow.insertCell(0);

    newCell.rowSpan = 3;
    newCell.style = 'width: 100px; color: red;';
    newCell.innerHTML = 'Rosalvo Ponte';
    newRow.appendChild(newCell);

    newCell = newRow.insertCell(1);
    newCell.rowSpan = 3;
    newCell.colSpan = 2;
    newCell.style = 'width: 200px; color: red; text-align:center;';
    newCell.innerHTML = document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text;

    newCell = newRow.insertCell(2);
    newCell.style = 'width: 100px; color: red; text-align: left;';
    newCell.innerHTML = 'Data';

    newCell = newRow.insertCell(3);
    newCell.innerHTML = dataEvento;
    newCell.colSpan = 3;//alt

    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.innerHTML = 'Hora';
    newCell = newRow.insertCell(1);
    newCell.colSpan = 3;//alt
    newCell.innerHTML = horaEvento;

    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.innerHTML = 'Local';
    newCell = newRow.insertCell(1);
    newCell.innerHTML = localEvento;

    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.innerHTML = 'Código';
    newCell = newRow.insertCell(1);
    newCell.style = 'width: 200px; color: red; min-width:300px; text-align:center;';
    newCell.innerHTML = 'Descrição';
    newCell = newRow.insertCell(2);
    newCell.innerHTML = 'Quantidade';
    newCell = newRow.insertCell(3);
    newCell.colSpan = 3;//alt
    newCell.innerHTML = 'Observação';
    //newCell = newRow.insertCell(4);
    //newCell.innerHTML = 'Total';

    /*newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.colSpan = 4;
    newCell.style = 'width: 100%;';
    newCell.innerHTML = 'Total';
    newCell = newRow.insertCell(1);*/
}

function addObservacaoOnCarrinho() {
    var tableRef = document.getElementById('tablePrint');
    for (var r = 4, n = tableRef.rows.length, j = 0; r < n; r++ , j++) {
        //alert($('#obs' + i).val());
        //alert(r + ' ' + n);
        //alert(carrinhoProdutosArray[j][4]);
        try {
            console.log('carro: ' + carrinhoProdutosArray[j][4] + ' ' + ' obs' + $('#obs' + j).val());
            carrinhoProdutosArray[j][4] = $('#obs' + j).val();
        }
        catch (err) {
            console.log(err);
        }
    }
}

function novoEvento() {
    var r = confirm("Você perderá todos os pedidos adicionados no atual evento. Deseja continuar?");
    if (r === true) {
        //$('finalizarPedido').click(false);
        clearAllValues();
        //$('#briefingChoice').click(true);
        document.getElementById("briefingChoice").disabled = false;
    } else {
        console.log('Novo evento cancelado!');
    }
}

function addPedidoOnSaidaEstoque() {
    var tableRef = document.getElementById('tablePrint');
    //var i = 0;
    $('finalizarPedido').click(false);
    addObservacaoOnCarrinho();
    for (var r = 4, n = tableRef.rows.length, i = 0; r < n; r++ , i++) {
        try {
            if (carrinhoProdutosArray[i][5] === 0) {
                alert('nao devia entrar aqui');
                createListItem('Saída de Itens do ESTOQUE para PRODUÇÃO', parseInt(carrinhoProdutosArray[i][0]), parseInt(carrinhoProdutosArray[i][1]), parseInt(carrinhoProdutosArray[i][2]), carrinhoProdutosArray[i][3], carrinhoProdutosArray[i][4]);
            }
            else if (carrinhoProdutosArray[i][5] === 1) {
                updateListItem('Saída de Itens do ESTOQUE para PRODUÇÃO', parseInt(carrinhoProdutosArray[i][6]), parseInt(carrinhoProdutosArray[i][2]), carrinhoProdutosArray[i][4]);
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    if (errorAddProduct === 1) {
        alert('Houve algum problema ao adicionar pelo menos um dos produtos adicionados.');
    }
    else {
        //alert('O pedido para ' + document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text + ' foi finalizado com sucesso!');
        //clearAllValues();
    }
    alert('O pedido para ' + document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text + ' foi finalizado com sucesso!');
    clearAllValues();
}

/*
 *  Initialize datepicker 
 */
function initializeDatePickers() {
    var calendarOptions = [];
    calendarOptions.push(_spPageContextInfo.webServerRelativeUrl + '/' + _spPageContextInfo.layoutsUrl + '/iframe.aspx?');
    //alert(_spPageContextInfo.webServerRelativeUrl + '/' + _spPageContextInfo.layoutsUrl + '/iframe.aspx?');
    calendarOptions.push('&cal=1');
    calendarOptions.push('&lcid=1046');
    calendarOptions.push('&langid=1046');
    calendarOptions.push('&tz=-08:00:00.0002046');
    calendarOptions.push('&ww=0111110');
    calendarOptions.push('&fdow=0');
    calendarOptions.push('&fwoy=0');
    calendarOptions.push('&hj=0');
    calendarOptions.push('&swn=false');
    calendarOptions.push('&minjday=109207');
    calendarOptions.push('&maxjday=2666269');
    calendarOptions.push('&date=');

    $('[field-type="DateTime"]').each(function (index) {
        var id = $(this).attr('id');
        $(this).after('<iframe id="' + id + 'DatePickerFrame" title="Select a date from the calendar." style="display:none; position:absolute; width:200px; z-index:101;" src="/_layouts/15/images/blank.gif?rev=23"></iframe>');
        $(this).after('<a href="#" style="vertical-align:-10px;"><img style="margin-top:-5px;" id="' + id + 'DatePickerImage" border="0" alt="Select a date from the calendar." src="/_layouts/15/images/calendar_25.gif?rev=23"></a>');
        $(this).next('a').attr('onclick', "clickDatePicker('" + id + "', '" + calendarOptions.join('') + "', '', event); return false;");
    });
}

/*=======================================================\/GERAR RELATÓRIO\/==============================================================*/

function genPDF() {

    var doc = new jsPDF('p', 'pt');

    var res = doc.autoTableHtmlToJson(document.getElementById("tablePrint"));
    doc.autoTable(res.columns, res.data, { startY: 40 });

}

function tableToJson(table) {
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
}

function teste() {

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

            if (rowCount == 1) {
                doc.margins = 1;
                doc.setFont("helvetica");
                doc.setFontType("bold");
                doc.setFontSize(9);

                doc.cell(leftMargin, topMargin, cellWidth, headerRowHeight, cellContent, i)
            }
            else if (rowCount == 2) {
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