/* global authentication, tenantId, LoanHandler, ClientHandler, clientList, user, host */

var clientSelectedBdate;
var clientimagecreateformData;

var loanEmpStartDate;
var loanSelfEmpStartDate;
var loanDisDate;

var Options = function () {

    Options.self = this;
    //client functions
    $('#clientCreateIdDocumentType').on('input', Options.prototype.clientDocumentTypeSelectHandler);
    $('#createClientBottom').on('click', Options.prototype.toClientConfirmPage);
    $('#modifyClientBottom').on('click', Options.prototype.modifyClientCreationFields);
    $('#confirmClientBottom').on('click', Options.prototype.submitClientData);
    $('#newClientBottom').on('click', Options.prototype.createClient);
    $('#listClientBottom').on('click', Options.prototype.clientCreationList);
    $('#clientImageIDSelector').on('change', Options.prototype.clientImageUpload);

    $("#clientCreationForm").submit(function (e) {
        e.preventDefault();
    });
    //loan functions
    $('#createLoanApplicationBottom').on('click', Options.prototype.toLoanConfirmPage);
    $('#modifyLoanApplicationBottom').on('click', Options.prototype.modifyLoanCreationFields);
    $('#confirmLoanApplicationBottom').on('click', Options.prototype.submitLoanData);
    $('#listLoanApplicationBottom').on('click', Options.prototype.loanApplicationCreationList);
    $('#newLoanApplicationBottom').on('click', ClientHandler.prototype.getAllClientsForLoanApplication);
    $('#loanClientEmployed').on('input', Options.prototype.loanClientEmployedSelectHandler);
    $('#loanClientSelfEmployed').on('input', Options.prototype.loanClientSelfEmployedSelectHandler);
    $('#loanClientSelfEmpType').on('input', Options.prototype.loanClientSelfEmployedEmploymentTypeSelectHandler);
    $('#loanClientCerditCT').on('input', Options.prototype.loanClientCreditTypeSelectHandler);
    $('#loanClientHaveGuarantor').on('input', Options.prototype.loanClientGuarantorSelectHandler);


    $("#createLoanApplicationForm").submit(function (e) {
        e.preventDefault();
    });

    //loan disburse
    $('#disburseLoanPaymentType').on('input', Options.prototype.loanDisbursePaymentType);
    $('#disburseLoanDisburseBottom').on('click', Options.prototype.toLoanDisbursementConfirmPage);
    $('#modifyLoanDisburseBottom').on('click', Options.prototype.modifyDisbursementLoanFields);
    $('#confirmLoanDisburseBottom').on('click', Options.prototype.submitDisbursementData);



    $("#disburseLoanForm").submit(function (e) {
        e.preventDefault();
    });
};

/* external */
Options.prototype.overview = function () {
    addHistory('Options overview', '#optionsOverview', '#options a');
    initDefaultContent('Business');
    currentTable = 'options';

    var $rowContainer = getDefaultRowContainer({type: 'Items available'});
    addRow($rowContainer, {type: 'Add Client'/*, number: 1*/}, 'Options', Options.self.rowClickHandler, 'createClient');
    addRow($rowContainer, {type: 'Create Loan Application'/*, number: 7*/}, 'Loan', ReportingHandler.self.rowClickHandler, 'firstGenericLoanReports');
};

//Create client functioanlities

Options.prototype.createClient = function () {
    addHistory('create accounting entry', '#createAccountingEntry', getSidebarSubitemSelector('accounting', 'Accounting', 'create'));
    Options.prototype.initClientPage();
    initDefaultContent('Create Client');

    showContent($('#createClient'));
};

Options.prototype.toClientConfirmPage = function () {




    if (
            document.getElementById("clientCreateF").checkValidity() &&
            document.getElementById("clientCreateM").checkValidity() &&
            document.getElementById("clientCreateL").checkValidity() &&
            document.getElementById("clientCreateG").checkValidity() &&
            document.getElementById("clientCreateP1").checkValidity() &&
            document.getElementById("clientCreateP2").checkValidity() &&
            document.getElementById("clientCreateIdDocument").checkValidity() &&
            document.getElementById("clientCreateN").checkValidity() &&
            document.getElementById("clientImageIDSelector").checkValidity() &&
            document.getElementById("createClientBirthdate").checkValidity()
            )
    {
        //addHistory('create accounting entry', '#createAccountingEntry', getSidebarSubitemSelector('accounting', 'Accounting', 'create'));
        initDefaultContent('Please confirm the client data');
        showContent($('#createClient'));
        document.getElementById("clientCreateF").disabled = true;
        document.getElementById("clientCreateM").disabled = true;
        document.getElementById("clientCreateL").disabled = true;
        document.getElementById("clientCreateG").disabled = true;
        document.getElementById("clientCreateP1").disabled = true;
        document.getElementById("clientCreateP2").disabled = true;
        document.getElementById("clientImageIDSelector").disabled = true;
        document.getElementById("clientCreateIdDocument").disabled = true;
        document.getElementById("clientCreateIdDocumentType").disabled = true;
        document.getElementById("clientCreateN").disabled = true;
        document.getElementById("createClientBirthdate").disabled = true;
        document.getElementById("createClientBirthdate").style.backgroundColor = "#eee";
        $("#createClientBottom").hide();
        $("#confirmClientBottom").show();
        $("#modifyClientBottom").show();
        $("#listClientBottom").hide();
        $("#newClientBottom").hide();
    }

};

Options.prototype.rowClickHandler = function () {
    var action = $(this).data('id');
    var handler = $(this).data('object');
    $('li[data-parent~="options"][data-handler="' + handler + '"][data-action~="' + action + '"] a').click();
};

Options.prototype.actionButtonHandler = function (event) {
    event.preventDefault();
    hideContent();

    switch ($(this).data('action')) {
        case 'back':
            history.back();
            break;
        case 'resetChanges':

            break;

        case 'submit':

            break;
        default:
            // noop
            break;
    }


};

Options.prototype.clientDocumentTypeSelectHandler = function () {
    if (document.getElementById("clientCreateIdDocumentType").value !== "NONE")
    {
        document.getElementById("clientCreateIdDocument").required = true;
        document.getElementById("clientCreateIdDocument").disabled = false;
    } else {
        document.getElementById("clientCreateIdDocument").required = false;
        document.getElementById("clientCreateIdDocument").disabled = true;
        document.getElementById("clientCreateIdDocument").value = "";
    }
};

Options.prototype.initClientPage = function () {


    document.getElementById("clientCreateF").disabled = false;
    document.getElementById("clientCreateM").disabled = false;
    document.getElementById("clientCreateL").disabled = false;
    document.getElementById("clientCreateG").disabled = false;
    document.getElementById("clientCreateP1").disabled = false;
    document.getElementById("clientCreateP2").disabled = false;
    document.getElementById("clientCreateIdDocument").disabled = true;
    document.getElementById("clientCreateIdDocumentType").disabled = false;
    document.getElementById("clientCreateN").disabled = false;
    document.getElementById("createClientBirthdate").disabled = false;
    document.getElementById("clientImageIDSelector").disabled = false;
    document.getElementById("createClientBirthdate").style.backgroundColor = "white";

    document.getElementById("clientCreateF").value = "";
    document.getElementById("clientCreateM").value = "";
    document.getElementById("clientCreateL").value = "";
    document.getElementById("clientCreateG").value = "";
    document.getElementById("clientCreateP1").value = "";
    document.getElementById("clientCreateP2").value = "";
    document.getElementById("clientCreateIdDocument").value = "";
    document.getElementById("clientCreateIdDocumentType").value = "NONE";
    document.getElementById("clientCreateN").value = "";
    document.getElementById("createClientBirthdate").value = "";
    $('#clientImageID11').attr("src", "images/personPlaceholderNoText.png");
    document.getElementById("clientImageIDSelector").value = "";

    $("#createClientBottom").show();
    $("#confirmClientBottom").hide();
    $("#modifyClientBottom").hide();
    $("#listClientBottom").hide();
    $("#newClientBottom").hide();
};

Options.prototype.modifyClientCreationFields = function () {

    initDefaultContent('Create Client');
    showContent($('#createClient'));
    document.getElementById("clientCreateF").disabled = false;
    document.getElementById("clientCreateM").disabled = false;
    document.getElementById("clientCreateL").disabled = false;
    document.getElementById("clientCreateG").disabled = false;
    document.getElementById("clientCreateP1").disabled = false;
    document.getElementById("clientCreateP2").disabled = false;
    document.getElementById("clientCreateIdDocument").disabled = true;
    document.getElementById("clientCreateIdDocumentType").disabled = false;
    document.getElementById("clientCreateN").disabled = false;
    document.getElementById("createClientBirthdate").disabled = false;
    document.getElementById("clientImageIDSelector").disabled = false;
    document.getElementById("createClientBirthdate").style.backgroundColor = "white";



    if (document.getElementById("clientCreateIdDocumentType").value === "NONE") {
        document.getElementById("clientCreateIdDocument").disabled = true;
    } else {
        document.getElementById("clientCreateIdDocument").disabled = false;
    }


    $("#createClientBottom").show();
    $("#confirmClientBottom").hide();
    $("#modifyClientBottom").hide();
    $("#listClientBottom").hide();
    $("#newClientBottom").hide();
};

Options.prototype.clientCreationPassed = function () {
    initDefaultContent('Client Creation is done sucessfully');
    showContent($('#createClient'));

    $("#createClientBottom").hide();
    $("#confirmClientBottom").hide();
    $("#modifyClientBottom").hide();
    $("#listClientBottom").show();
    $("#newClientBottom").show();

    message('Success',
            'The client has been successfully created',
            MessageType.SUCCESS);
};

Options.prototype.clientCreationList = function () {
    $("#createClientSideBar").removeClass('active');
    $("#createClientSideBar").addClass('hidden');
    $("#createLoanSideBar").addClass('hidden');

    $("#reporting").addClass('active');

    ClientHandler.prototype.getAll();
};

Options.prototype.submitClientData = function () {

    headers = getAuthenticationHeader();
    var uri = '/client/v1d';
    var body = '{"' +
            'firstname":"' + $('#clientCreateF').val() +
            '","middlename":"' + $('#clientCreateM').val() +
            '","lastname":"' + $('#clientCreateL').val() +
            '","birthdate":"' + clientSelectedBdate +
            '","nationality":"' + $('#clientCreateN').val() +
            '","iddocumenttype":"' + $('#clientCreateIdDocumentType').val() +
            '","iddocument":"' + $('#clientCreateIdDocument').val() +
            '","phone1":"' + $('#clientCreateP1').val() +
            '","phone2":"' + $('#clientCreateP2').val() +
            '","gender":"' + $('#clientCreateG').val() +
            '","site":"' + "MFI_OFFICE" +
            '"}';
    ajax(uri, 'POST',
            function (Response) {
                var fd = new FormData();
                var file_data = $('#clientImageIDSelector').prop("files")[0]; // for multiple files
                fd.append("payload", file_data);
                fd.append("datatype", "PHOTOGRAPHY");
                fd.append("deviceId", "CockpitUI");
                fd.append("authentication", authentication);
                fd.append("tenantId", tenantId);
                fd.append("awamoId", Response['awamoId']);


                $.ajax({
                    url: host + "/client/v1d/upload",
                    data: fd,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    beforeSend: function () {
                        $body = $("body");
                        $body.addClass("loading");
                        //$body.removeClass("loading");
                    },
                    success: function (data) {
                        Options.prototype.clientCreationPassed();
                    },
                    complete: function () {
                        $body = $("body");
                        //$body.addClass("loading");
                        $body.removeClass("loading");
                    }
                }).fail(function (Response) {
                    console.log(Response);
                    message(
                            'Warning',
                            " Client creation failed, please contact the support",
                            MessageType.WARNING);
                });
            },
            body, headers,
            function (Response) {
                console.log(Response);
                message(
                        'Warning',
                        " Client creation failed, please contact the support",
                        MessageType.WARNING);
            }
    );




};

Options.prototype.clientImageUpload = function () {
    var reader = new FileReader();
    reader.onload = function (e) {
        // get loaded data and render thumbnail.
        $('#clientImageID11').attr("src", e.target.result);
        clientimagecreateformData = new FormData(e.target.result);
    };
    // read the image file as a data URL.
    reader.readAsDataURL(this.files[0]);
};

//Create loan application functioanlities

Options.prototype.createLoanApplication = function (client) {
    Options.prototype.initLoanApplicationPage(client.awamoId);
    initDefaultContent('Create Loan Application');


    showContent($('#createLoanApplication'));
    $('html, body').animate({scrollTop: 0}, 'fast');
};

Options.prototype.initLoanApplicationPage = function (awamoId) {

    document.getElementById("loanClientImageID1").src = "images/personPlaceholderNoText.png";
    loanEmpStartDate = "";
    loanSelfEmpStartDate = "";
    loanDisDate = "";

    //fill client data
    var clientlist = clientList.getEntities().filter(function (client) {
        return client.awamoId === awamoId;
    });
    document.getElementById("loanClientAwamoId").value = clientlist[0]['awamoId'];
    document.getElementById("loanClientFirstName").value = clientlist[0]['firstname'];
    document.getElementById("loanClientMiddleName").value = clientlist[0]['middlename'];
    document.getElementById("loanClientLastName").value = clientlist[0]['lastname'];
    document.getElementById("loanClientBirthdate").value = formatDate(clientlist[0]['birthdate']);
    document.getElementById("loanClientNationality").value = clientlist[0]['nationality'];
    document.getElementById("loanClientSubmitdate").value = formatDate(clientlist[0]['submitDate']);
    document.getElementById("loanClientIdDocumentType").value = clientlist[0]['iddocumenttype'];
    document.getElementById("loanClientIdDocument").value = clientlist[0]['iddocument'];
    document.getElementById("loanClientPhone1").value = clientlist[0]['phone1'];
    document.getElementById("loanClientPhone2").value = clientlist[0]['phone2'];
    document.getElementById("loanClientGender").value = clientlist[0]['gender'];
    document.getElementById("loanClientLocation").value = clientlist[0]['site'];

    $.ajax({
        url: host + '/client/v1d/find?' +
                'awamoId=' + clientlist[0]['awamoId'] + '&' +
                'deviceId=cockpit&' +
                'datatype=PHOTOGRAPHY',
        type: 'GET',
        headers: getAuthenticationHeader(),
        xhrFields: {
            responseType: 'arraybuffer'
        }
    })
            .done(function (e) {
                var blob = new Blob([e], {type: 'image/jpg'});
                var fr = new FileReader();
                fr.onload = function (e) {
                    document.getElementById("loanClientImageID1").src = e.target.result;
                };
                fr.readAsDataURL(blob);
            })
            .fail(function (e) {
                document.getElementById("loanClientImageID1").src = "images/personPlaceholderNoText.png";
                console.log('fail');
                console.log(e);
            });

    //client information
    document.getElementById("loanClientProvince").disabled = false;
    document.getElementById("loanClientCity").disabled = false;
    document.getElementById("loanClientFirstNOCIH").disabled = false;
    document.getElementById("loanClientLivingArea").disabled = false;
    document.getElementById("loanClientStreet").disabled = false;
    document.getElementById("loanClientNOC").disabled = false;
    document.getElementById("loanClientMartialStatus").disabled = false;
    document.getElementById("loanClientEmployed").disabled = false;
    document.getElementById("loanClientSelfEmployed").disabled = false;

    document.getElementById("loanClientProvince").value = "";
    document.getElementById("loanClientCity").value = "";
    document.getElementById("loanClientFirstNOCIH").value = "";
    document.getElementById("loanClientLivingArea").value = "";
    document.getElementById("loanClientStreet").value = "";
    document.getElementById("loanClientNOC").value = "";
    document.getElementById("loanClientMartialStatus").value = "";
    document.getElementById("loanClientEmployed").value = "";
    document.getElementById("loanClientSelfEmployed").value = "";

    //Employment Fields
    document.getElementById("loanClientEmpCompanyName").disabled = true;
    document.getElementById("loanClientEmpMonIncome").disabled = true;
    document.getElementById("loanClientEmpSector").disabled = true;
    document.getElementById("loanClientEmpProvince").disabled = true;
    document.getElementById("loanClientEmpStreet").disabled = true;
    document.getElementById("loanClientStartDate").disabled = true;
    document.getElementById("loanClientEmpNOE").disabled = true;
    document.getElementById("loanClientEmpFoRe").disabled = true;
    document.getElementById("loanClientEmpCity").disabled = true;
    document.getElementById("loanClientStartDate").style.backgroundColor = "#eee";

    document.getElementById("loanClientEmpCompanyName").required = false;
    document.getElementById("loanClientEmpMonIncome").required = false;
    document.getElementById("loanClientEmpSector").required = false;
    document.getElementById("loanClientEmpProvince").required = false;
    document.getElementById("loanClientEmpStreet").required = false;
    document.getElementById("loanClientStartDate").required = false;
    document.getElementById("loanClientEmpNOE").required = false;
    document.getElementById("loanClientEmpFoRe").required = false;
    document.getElementById("loanClientEmpCity").required = false;

    document.getElementById("loanClientEmpCompanyName").value = "";
    document.getElementById("loanClientEmpMonIncome").value = "";
    document.getElementById("loanClientEmpSector").value = "";
    document.getElementById("loanClientEmpProvince").value = "";
    document.getElementById("loanClientEmpStreet").value = "";
    document.getElementById("loanClientStartDate").value = "";
    document.getElementById("loanClientEmpNOE").value = "";
    document.getElementById("loanClientEmpFoRe").value = "";
    document.getElementById("loanClientEmpCity").value = "";

    //Self Employment Fields
    document.getElementById("loanClientSelfEmpCompanyName").disabled = true;
    document.getElementById("loanClientSelfEmpMonIncome").disabled = true;
    document.getElementById("loanClientSelfEmpType").disabled = true;
    document.getElementById("loanClientSelfEmpAPro").disabled = true;
    document.getElementById("loanClientSelfEmpProvince").disabled = true;
    document.getElementById("loanClientSelfEmpStreet").disabled = true;
    document.getElementById("loanClientSelfStartDate").disabled = true;
    document.getElementById("loanClientSelfEmpNOE").disabled = true;
    document.getElementById("loanClientSelfEmpBSector").disabled = true;
    document.getElementById("loanClientSelfEmpFoRe").disabled = true;
    document.getElementById("loanClientSelfEmpCity").disabled = true;
    document.getElementById("loanClientSelfStartDate").style.backgroundColor = "#eee";

    document.getElementById("loanClientSelfEmpCompanyName").required = false;
    document.getElementById("loanClientSelfEmpMonIncome").required = false;
    document.getElementById("loanClientSelfEmpType").required = false;
    document.getElementById("loanClientSelfEmpAPro").required = false;
    document.getElementById("loanClientSelfEmpProvince").required = false;
    document.getElementById("loanClientSelfEmpStreet").required = false;
    document.getElementById("loanClientSelfStartDate").required = false;
    document.getElementById("loanClientSelfEmpNOE").required = false;
    document.getElementById("loanClientSelfEmpBSector").required = false;
    document.getElementById("loanClientSelfEmpFoRe").required = false;
    document.getElementById("loanClientSelfEmpCity").required = false;

    document.getElementById("loanClientSelfEmpCompanyName").value = "";
    document.getElementById("loanClientSelfEmpMonIncome").value = "";
    document.getElementById("loanClientSelfEmpType").value = "";
    document.getElementById("loanClientSelfEmpAPro").value = "";
    document.getElementById("loanClientSelfEmpProvince").value = "";
    document.getElementById("loanClientSelfEmpStreet").value = "";
    document.getElementById("loanClientSelfStartDate").value = "";
    document.getElementById("loanClientSelfEmpNOE").value = "";
    document.getElementById("loanClientSelfEmpBSector").value = "";
    document.getElementById("loanClientSelfEmpFoRe").value = "";
    document.getElementById("loanClientSelfEmpCity").value = "";

    //loan information

    document.getElementById("loanClientDuration").disabled = false;
    document.getElementById("loanClientPrincipal").disabled = false;
    document.getElementById("loanClientNORe").disabled = false;
    document.getElementById("loanClientAIR").disabled = false;
    document.getElementById("loanClientDuTy").disabled = false;
    document.getElementById("loanClientDiDate").disabled = false;
    document.getElementById("loanClientInType").disabled = false;
    document.getElementById("loanClientICPT").disabled = false;
    document.getElementById("loanClientReason").disabled = false;

    document.getElementById("loanClientDuration").value = "";
    document.getElementById("loanClientPrincipal").value = "";
    document.getElementById("loanClientNORe").value = "";
    document.getElementById("loanClientAIR").value = "";
    document.getElementById("loanClientDuTy").value = "";
    document.getElementById("loanClientDiDate").value = "";
    document.getElementById("loanClientInType").value = "";
    document.getElementById("loanClientICPT").value = "";
    document.getElementById("loanClientReason").value = "";


    //credit information
    document.getElementById("loanClientCerditCT").disabled = false;
    document.getElementById("loanClientCerditCTV").disabled = true;

    document.getElementById("loanClientCerditCT").value = "";
    document.getElementById("loanClientCerditCTV").value = "";

    document.getElementById("loanClientCerditCTV").required = false;

    //guarantor
    document.getElementById("loanClientHaveGuarantor").disabled = false;
    document.getElementById("loanClientGuarantorName").disabled = true;
    document.getElementById("loanClientGuarantorIncome").disabled = true;

    document.getElementById("loanClientGuarantorName").value = "";
    document.getElementById("loanClientGuarantorIncome").value = "";
    document.getElementById("loanClientHaveGuarantor").value = "";



    $("#createLoanApplicationBottom").show();
    $("#confirmLoanApplicationBottom").hide();
    $("#modifyLoanApplicationBottom").hide();
    $("#listLoanApplicationBottom").hide();
    $("#newLoanApplicationBottom").hide();
};

Options.prototype.toLoanConfirmPage = function () {



    if (
            //client data
            document.getElementById("loanClientProvince").checkValidity() &&
            document.getElementById("loanClientCity").checkValidity() &&
            document.getElementById("loanClientFirstNOCIH").checkValidity() &&
            document.getElementById("loanClientLivingArea").checkValidity() &&
            document.getElementById("loanClientStreet").checkValidity() &&
            document.getElementById("loanClientNOC").checkValidity() &&
            document.getElementById("loanClientMartialStatus").checkValidity() &&
            //emplyed
            document.getElementById("loanClientEmployed").checkValidity() &&
            document.getElementById("loanClientEmpCompanyName").checkValidity() &&
            document.getElementById("loanClientEmpMonIncome").checkValidity() &&
            document.getElementById("loanClientEmpSector").checkValidity() &&
            document.getElementById("loanClientEmpProvince").checkValidity() &&
            document.getElementById("loanClientStartDate").checkValidity() &&
            document.getElementById("loanClientEmpNOE").checkValidity() &&
            document.getElementById("loanClientEmpFoRe").checkValidity() &&
            document.getElementById("loanClientEmpCity").checkValidity() &&
            document.getElementById("loanClientEmpStreet").checkValidity() &&
            //self employed
            document.getElementById("loanClientSelfEmployed").checkValidity() &&
            document.getElementById("loanClientSelfEmpCompanyName").checkValidity() &&
            document.getElementById("loanClientSelfEmpMonIncome").checkValidity() &&
            document.getElementById("loanClientSelfEmpBSector").checkValidity() &&
            document.getElementById("loanClientSelfEmpFoRe").checkValidity() &&
            document.getElementById("loanClientSelfEmpProvince").checkValidity() &&
            document.getElementById("loanClientSelfStartDate").checkValidity() &&
            document.getElementById("loanClientSelfEmpNOE").checkValidity() &&
            document.getElementById("loanClientSelfEmpType").checkValidity() &&
            document.getElementById("loanClientSelfEmpAPro").checkValidity() &&
            document.getElementById("loanClientSelfEmpCity").checkValidity() &&
            document.getElementById("loanClientSelfEmpStreet").checkValidity() &&
            //loan data
            document.getElementById("loanClientDuration").checkValidity() &&
            document.getElementById("loanClientPrincipal").checkValidity() &&
            document.getElementById("loanClientNORe").checkValidity() &&
            document.getElementById("loanClientAIR").checkValidity() &&
            document.getElementById("loanClientDuTy").checkValidity() &&
            document.getElementById("loanClientDiDate").checkValidity() &&
            document.getElementById("loanClientInType").checkValidity() &&
            document.getElementById("loanClientICPT").checkValidity() &&
            document.getElementById("loanClientReason").checkValidity() &&
            //credit data
            document.getElementById("loanClientCerditCT").checkValidity() &&
            document.getElementById("loanClientCerditCTV").checkValidity() &&
            document.getElementById("loanClientGuarantorName").checkValidity() &&
            document.getElementById("loanClientHaveGuarantor").checkValidity() &&
            document.getElementById("loanClientGuarantorIncome").checkValidity()
            )
    {
        //addHistory('create accounting entry', '#createAccountingEntry', getSidebarSubitemSelector('accounting', 'Accounting', 'create'));
        initDefaultContent('Please confirm the loan application data');
        showContent($('#createLoanApplication'));

        //client data
        document.getElementById("loanClientProvince").disabled = true;
        document.getElementById("loanClientCity").disabled = true;
        document.getElementById("loanClientFirstNOCIH").disabled = true;
        document.getElementById("loanClientLivingArea").disabled = true;
        document.getElementById("loanClientStreet").disabled = true;
        document.getElementById("loanClientNOC").disabled = true;
        document.getElementById("loanClientMartialStatus").disabled = true;
        //emplyment data
        document.getElementById("loanClientEmployed").disabled = true;
        document.getElementById("loanClientEmpCompanyName").disabled = true;
        document.getElementById("loanClientEmpMonIncome").disabled = true;
        document.getElementById("loanClientEmpSector").disabled = true;
        document.getElementById("loanClientEmpProvince").disabled = true;
        document.getElementById("loanClientStartDate").disabled = true;
        document.getElementById("loanClientEmpNOE").disabled = true;
        document.getElementById("loanClientEmpFoRe").disabled = true;
        document.getElementById("loanClientEmpCity").disabled = true;
        document.getElementById("loanClientEmpStreet").disabled = true;
        document.getElementById("loanClientStartDate").style.backgroundColor = "#eee";
        //selfemployment data
        document.getElementById("loanClientSelfEmployed").disabled = true;
        document.getElementById("loanClientSelfEmpCompanyName").disabled = true;
        document.getElementById("loanClientSelfEmpMonIncome").disabled = true;
        document.getElementById("loanClientSelfEmpBSector").disabled = true;
        document.getElementById("loanClientSelfEmpFoRe").disabled = true;
        document.getElementById("loanClientSelfEmpProvince").disabled = true;
        document.getElementById("loanClientSelfStartDate").disabled = true;
        document.getElementById("loanClientSelfEmpNOE").disabled = true;
        document.getElementById("loanClientSelfEmpType").disabled = true;
        document.getElementById("loanClientSelfEmpAPro").disabled = true;
        document.getElementById("loanClientSelfEmpCity").disabled = true;
        document.getElementById("loanClientSelfEmpStreet").disabled = true;
        document.getElementById("loanClientSelfStartDate").style.backgroundColor = "#eee";
        // loan data
        document.getElementById("loanClientDuration").disabled = true;
        document.getElementById("loanClientAmortizationType").disabled = true;
        document.getElementById("loanClientPrincipal").disabled = true;
        document.getElementById("loanClientNORe").disabled = true;
        document.getElementById("loanClientAIR").disabled = true;
        document.getElementById("loanClientDuTy").disabled = true;
        document.getElementById("loanClientDiDate").disabled = true;
        document.getElementById("loanClientInType").disabled = true;
        document.getElementById("loanClientICPT").disabled = true;
        document.getElementById("loanClientReason").disabled = true;
        document.getElementById("loanClientDiDate").style.backgroundColor = "#eee";
        //credit data
        document.getElementById("loanClientCerditCT").disabled = true;
        document.getElementById("loanClientCerditCTV").disabled = true;
        document.getElementById("loanClientGuarantorName").disabled = true;
        document.getElementById("loanClientGuarantorIncome").disabled = true;
        document.getElementById("loanClientHaveGuarantor").disabled = true;

        $("#createLoanApplicationBottom").hide();
        $("#confirmLoanApplicationBottom").show();
        $("#modifyLoanApplicationBottom").show();
        $("#listLoanApplicationBottom").hide();
        $("#newLoanApplicationBottom").hide();
    }

};

Options.prototype.modifyLoanCreationFields = function () {

    initDefaultContent('Create Loan Application');
    showContent($('#createLoanApplication'));

    document.getElementById("loanClientProvince").disabled = false;
    document.getElementById("loanClientCity").disabled = false;
    document.getElementById("loanClientFirstNOCIH").disabled = false;
    document.getElementById("loanClientLivingArea").disabled = false;
    document.getElementById("loanClientStreet").disabled = false;
    document.getElementById("loanClientNOC").disabled = false;
    document.getElementById("loanClientMartialStatus").disabled = false;
    document.getElementById("loanClientEmployed").disabled = false;
    document.getElementById("loanClientSelfEmployed").disabled = false;
    document.getElementById("loanClientDuration").disabled = false;
    document.getElementById("loanClientPrincipal").disabled = false;
    document.getElementById("loanClientNORe").disabled = false;
    document.getElementById("loanClientAIR").disabled = false;
    document.getElementById("loanClientDuTy").disabled = false;
    document.getElementById("loanClientDiDate").disabled = false;
    document.getElementById("loanClientInType").disabled = false;
    document.getElementById("loanClientICPT").disabled = false;
    document.getElementById("loanClientReason").disabled = false;
    document.getElementById("loanClientCerditCT").disabled = false;
    document.getElementById("loanClientCerditCTV").disabled = false;
    document.getElementById("loanClientGuarantorName").disabled = false;
    document.getElementById("loanClientGuarantorIncome").disabled = false;
    document.getElementById("loanClientHaveGuarantor").disabled = false;

    if (document.getElementById("loanClientEmployed").value === "YES") {

        document.getElementById("loanClientEmpCompanyName").disabled = false;
        document.getElementById("loanClientEmpMonIncome").disabled = false;
        document.getElementById("loanClientEmpSector").disabled = false;
        document.getElementById("loanClientEmpProvince").disabled = false;
        document.getElementById("loanClientEmpStreet").disabled = false;
        document.getElementById("loanClientStartDate").disabled = false;
        document.getElementById("loanClientEmpNOE").disabled = false;
        document.getElementById("loanClientEmpFoRe").disabled = false;
        document.getElementById("loanClientEmpCity").disabled = false;
        document.getElementById("loanClientStartDate").style.backgroundColor = "white";

    } else {
        document.getElementById("loanClientEmpCompanyName").disabled = true;
        document.getElementById("loanClientEmpMonIncome").disabled = true;
        document.getElementById("loanClientEmpSector").disabled = true;
        document.getElementById("loanClientEmpProvince").disabled = true;
        document.getElementById("loanClientEmpStreet").disabled = true;
        document.getElementById("loanClientStartDate").disabled = true;
        document.getElementById("loanClientEmpNOE").disabled = true;
        document.getElementById("loanClientEmpFoRe").disabled = true;
        document.getElementById("loanClientEmpCity").disabled = true;
    }

    if (document.getElementById("loanClientSelfEmployed").value === "YES") {

        document.getElementById("loanClientSelfEmpCompanyName").disabled = false;
        document.getElementById("loanClientSelfEmpMonIncome").disabled = false;
        document.getElementById("loanClientSelfEmpBSector").disabled = false;
        document.getElementById("loanClientSelfEmpFoRe").disabled = false;
        document.getElementById("loanClientSelfEmpProvince").disabled = false;
        document.getElementById("loanClientSelfStartDate").disabled = false;
        document.getElementById("loanClientSelfEmpNOE").disabled = false;
        document.getElementById("loanClientSelfEmpType").disabled = false;
        document.getElementById("loanClientSelfEmpAPro").disabled = false;
        document.getElementById("loanClientSelfEmpCity").disabled = false;
        document.getElementById("loanClientSelfEmpStreet").disabled = false;
        document.getElementById("loanClientSelfStartDate").style.backgroundColor = "white";

        if (document.getElementById("loanClientSelfEmpType").value === "FARMER")
        {
            document.getElementById("loanClientSelfEmpAPro").disabled = false;
            document.getElementById("loanClientSelfEmpBSector").disabled = true;
        } else {

            if (document.getElementById("loanClientSelfEmpType").value === "OTHER")
            {
                document.getElementById("loanClientSelfEmpBSector").disabled = false;
                document.getElementById("loanClientSelfEmpAPro").disabled = true;
            }
            else {
                document.getElementById("loanClientSelfEmpBSector").disabled = true;
                document.getElementById("loanClientSelfEmpAPro").disabled = true;
            }
        }

    } else {
        document.getElementById("loanClientSelfEmpCompanyName").disabled = true;
        document.getElementById("loanClientSelfEmpMonIncome").disabled = true;
        document.getElementById("loanClientSelfEmpBSector").disabled = true;
        document.getElementById("loanClientSelfEmpFoRe").disabled = true;
        document.getElementById("loanClientSelfEmpProvince").disabled = true;
        document.getElementById("loanClientSelfStartDate").disabled = true;
        document.getElementById("loanClientSelfEmpNOE").disabled = true;
        document.getElementById("loanClientSelfEmpType").disabled = true;
        document.getElementById("loanClientSelfEmpAPro").disabled = true;
        document.getElementById("loanClientSelfEmpCity").disabled = true;
        document.getElementById("loanClientSelfEmpStreet").disabled = true;
    }

    if (document.getElementById("loanClientCerditCT").value === "UNSECURED" || document.getElementById("loanClientCerditCT").value === "") {
        document.getElementById("loanClientCerditCTV").disabled = true;
    } else {
        document.getElementById("loanClientCerditCTV").disabled = false;
    }

    if (document.getElementById("loanClientHaveGuarantor").value === "YES") {
        document.getElementById("loanClientGuarantorIncome").disabled = false;
        document.getElementById("loanClientGuarantorName").disabled = false;

    } else {
        document.getElementById("loanClientGuarantorIncome").disabled = true;
        document.getElementById("loanClientGuarantorName").disabled = true;
    }

    $("#createLoanApplicationBottom").show();
    $("#confirmLoanApplicationBottom").hide();
    $("#modifyLoanApplicationBottom").hide();
    $("#listLoanApplicationBottom").hide();
    $("#newLoanApplicationBottom").hide();
};

Options.prototype.loanCreationPassed = function () {
    initDefaultContent('Loan application is submitted sucessfully');
    showContent($('#createLoanApplication'));

    $("#createLoanApplicationBottom").hide();
    $("#confirmLoanApplicationBottom").hide();
    $("#modifyLoanApplicationBottom").hide();
    $("#listLoanApplicationBottom").show();
    $("#newLoanApplicationBottom").show();

    message('Success',
            'The loan application has been successfully created',
            MessageType.SUCCESS);
    $('html, body').animate({scrollTop: document.body.scrollHeight}, 'fast');
};

Options.prototype.loanApplicationCreationList = function () {
    $("#createLoanSideBar").removeClass('active');
    $("#createClientSideBar").addClass('hidden');
    $("#createLoanSideBar").addClass('hidden');

    $("#reporting").addClass('active');

    LoanHandler.prototype.firstGenericLoanReports();

    $('html, body').animate({scrollTop: 0}, 'fast');
};

Options.prototype.loanClientEmployedSelectHandler = function () {
    if (document.getElementById("loanClientEmployed").value === "YES")
    {
        document.getElementById("loanClientEmpCompanyName").required = true;
        document.getElementById("loanClientEmpCompanyName").disabled = false;

        document.getElementById("loanClientEmpMonIncome").required = true;
        document.getElementById("loanClientEmpMonIncome").disabled = false;

        document.getElementById("loanClientEmpSector").required = true;
        document.getElementById("loanClientEmpSector").disabled = false;

        document.getElementById("loanClientEmpProvince").required = true;
        document.getElementById("loanClientEmpProvince").disabled = false;

        document.getElementById("loanClientEmpStreet").required = true;
        document.getElementById("loanClientEmpStreet").disabled = false;

        document.getElementById("loanClientStartDate").required = true;
        document.getElementById("loanClientStartDate").disabled = false;

        document.getElementById("loanClientEmpNOE").required = true;
        document.getElementById("loanClientEmpNOE").disabled = false;

        document.getElementById("loanClientEmpFoRe").required = true;
        document.getElementById("loanClientEmpFoRe").disabled = false;

        document.getElementById("loanClientEmpCity").required = true;
        document.getElementById("loanClientEmpCity").disabled = false;

        document.getElementById("loanClientStartDate").style.backgroundColor = "white";

    } else {

        document.getElementById("loanClientEmpCompanyName").required = false;
        document.getElementById("loanClientEmpCompanyName").disabled = true;
        document.getElementById("loanClientEmpCompanyName").value = "";

        document.getElementById("loanClientEmpMonIncome").required = false;
        document.getElementById("loanClientEmpMonIncome").disabled = true;
        document.getElementById("loanClientEmpMonIncome").value = "";

        document.getElementById("loanClientEmpSector").required = false;
        document.getElementById("loanClientEmpSector").disabled = true;
        document.getElementById("loanClientEmpSector").value = "";

        document.getElementById("loanClientEmpProvince").required = false;
        document.getElementById("loanClientEmpProvince").disabled = true;
        document.getElementById("loanClientEmpProvince").value = "";

        document.getElementById("loanClientEmpStreet").required = false;
        document.getElementById("loanClientEmpStreet").disabled = true;
        document.getElementById("loanClientEmpStreet").value = "";

        document.getElementById("loanClientStartDate").required = false;
        document.getElementById("loanClientStartDate").disabled = true;
        document.getElementById("loanClientStartDate").value = "";

        document.getElementById("loanClientEmpNOE").required = false;
        document.getElementById("loanClientEmpNOE").disabled = true;
        document.getElementById("loanClientEmpNOE").value = "";

        document.getElementById("loanClientEmpFoRe").required = false;
        document.getElementById("loanClientEmpFoRe").disabled = true;
        document.getElementById("loanClientEmpFoRe").value = "";

        document.getElementById("loanClientEmpCity").required = false;
        document.getElementById("loanClientEmpCity").disabled = true;
        document.getElementById("loanClientEmpCity").value = "";

        document.getElementById("loanClientStartDate").style.backgroundColor = "#eee";
    }
};

Options.prototype.loanClientSelfEmployedSelectHandler = function () {
    if (document.getElementById("loanClientSelfEmployed").value === "YES")
    {
        document.getElementById("loanClientSelfEmpCompanyName").required = true;
        document.getElementById("loanClientSelfEmpCompanyName").disabled = false;

        document.getElementById("loanClientSelfEmpMonIncome").required = true;
        document.getElementById("loanClientSelfEmpMonIncome").disabled = false;

        document.getElementById("loanClientSelfEmpType").required = true;
        document.getElementById("loanClientSelfEmpType").disabled = false;

        document.getElementById("loanClientSelfEmpAPro").required = false;
        document.getElementById("loanClientSelfEmpAPro").disabled = true;

        document.getElementById("loanClientSelfEmpProvince").required = true;
        document.getElementById("loanClientSelfEmpProvince").disabled = false;

        document.getElementById("loanClientSelfStartDate").required = true;
        document.getElementById("loanClientSelfStartDate").disabled = false;

        document.getElementById("loanClientSelfEmpNOE").required = true;
        document.getElementById("loanClientSelfEmpNOE").disabled = false;

        document.getElementById("loanClientSelfEmpBSector").required = false;
        document.getElementById("loanClientSelfEmpBSector").disabled = true;

        document.getElementById("loanClientSelfEmpFoRe").required = true;
        document.getElementById("loanClientSelfEmpFoRe").disabled = false;

        document.getElementById("loanClientSelfEmpCity").required = true;
        document.getElementById("loanClientSelfEmpCity").disabled = false;

        document.getElementById("loanClientSelfEmpStreet").required = true;
        document.getElementById("loanClientSelfEmpStreet").disabled = false;

        document.getElementById("loanClientSelfStartDate").style.backgroundColor = "white";

    } else {

        document.getElementById("loanClientSelfEmpCompanyName").required = false;
        document.getElementById("loanClientSelfEmpCompanyName").disabled = true;
        document.getElementById("loanClientSelfEmpCompanyName").value = "";

        document.getElementById("loanClientSelfEmpMonIncome").required = false;
        document.getElementById("loanClientSelfEmpMonIncome").disabled = true;
        document.getElementById("loanClientSelfEmpMonIncome").value = "";

        document.getElementById("loanClientSelfEmpType").required = false;
        document.getElementById("loanClientSelfEmpType").disabled = true;
        document.getElementById("loanClientSelfEmpType").value = "";

        document.getElementById("loanClientSelfEmpAPro").required = false;
        document.getElementById("loanClientSelfEmpAPro").disabled = true;
        document.getElementById("loanClientSelfEmpAPro").value = "";

        document.getElementById("loanClientSelfEmpProvince").required = false;
        document.getElementById("loanClientSelfEmpProvince").disabled = true;
        document.getElementById("loanClientSelfEmpProvince").value = "";

        document.getElementById("loanClientSelfStartDate").required = false;
        document.getElementById("loanClientSelfStartDate").disabled = true;
        document.getElementById("loanClientSelfStartDate").value = "";

        document.getElementById("loanClientSelfEmpNOE").required = false;
        document.getElementById("loanClientSelfEmpNOE").disabled = true;
        document.getElementById("loanClientSelfEmpNOE").value = "";

        document.getElementById("loanClientSelfEmpBSector").required = false;
        document.getElementById("loanClientSelfEmpBSector").disabled = true;
        document.getElementById("loanClientSelfEmpBSector").value = "";

        document.getElementById("loanClientSelfEmpFoRe").required = false;
        document.getElementById("loanClientSelfEmpFoRe").disabled = true;
        document.getElementById("loanClientSelfEmpFoRe").value = "";

        document.getElementById("loanClientSelfEmpCity").required = false;
        document.getElementById("loanClientSelfEmpCity").disabled = true;
        document.getElementById("loanClientSelfEmpCity").value = "";

        document.getElementById("loanClientSelfEmpStreet").required = false;
        document.getElementById("loanClientSelfEmpStreet").disabled = true;
        document.getElementById("loanClientSelfEmpStreet").value = "";

        document.getElementById("loanClientSelfStartDate").style.backgroundColor = "#eee";
    }
};

Options.prototype.loanClientSelfEmployedEmploymentTypeSelectHandler = function () {
    if (document.getElementById("loanClientSelfEmpType").value === "FARMER")
    {
        document.getElementById("loanClientSelfEmpAPro").required = true;
        document.getElementById("loanClientSelfEmpAPro").disabled = false;

        document.getElementById("loanClientSelfEmpBSector").required = false;
        document.getElementById("loanClientSelfEmpBSector").disabled = true;
        document.getElementById("loanClientSelfEmpBSector").value = "";

    } else {

        if (document.getElementById("loanClientSelfEmpType").value === "OTHER")
        {
            document.getElementById("loanClientSelfEmpBSector").required = true;
            document.getElementById("loanClientSelfEmpBSector").disabled = false;

            document.getElementById("loanClientSelfEmpAPro").required = false;
            document.getElementById("loanClientSelfEmpAPro").disabled = true;
            document.getElementById("loanClientSelfEmpAPro").value = "";

        }
        else {
            document.getElementById("loanClientSelfEmpBSector").required = false;
            document.getElementById("loanClientSelfEmpBSector").disabled = true;
            document.getElementById("loanClientSelfEmpBSector").value = "";

            document.getElementById("loanClientSelfEmpAPro").required = false;
            document.getElementById("loanClientSelfEmpAPro").disabled = true;
            document.getElementById("loanClientSelfEmpAPro").value = "";
        }
    }
};

Options.prototype.loanClientCreditTypeSelectHandler = function () {
    if (document.getElementById("loanClientCerditCT").value === "UNSECURED" || document.getElementById("loanClientCerditCT").value === "")
    {
        document.getElementById("loanClientCerditCTV").required = false;
        document.getElementById("loanClientCerditCTV").disabled = true;
        document.getElementById("loanClientCerditCTV").value = "";

    } else {
        document.getElementById("loanClientCerditCTV").required = true;
        document.getElementById("loanClientCerditCTV").disabled = false;
    }
};

Options.prototype.loanClientGuarantorSelectHandler = function () {
    if (document.getElementById("loanClientHaveGuarantor").value !== "YES")
    {
        document.getElementById("loanClientGuarantorIncome").required = false;
        document.getElementById("loanClientGuarantorIncome").disabled = true;
        document.getElementById("loanClientGuarantorIncome").value = "";

        document.getElementById("loanClientGuarantorName").required = false;
        document.getElementById("loanClientGuarantorName").disabled = true;
        document.getElementById("loanClientGuarantorName").value = "";

    } else {
        document.getElementById("loanClientGuarantorIncome").required = true;
        document.getElementById("loanClientGuarantorIncome").disabled = false;

        document.getElementById("loanClientGuarantorName").required = true;
        document.getElementById("loanClientGuarantorName").disabled = false;
    }
};

Options.prototype.submitLoanData = function () {

    var uri = '/loan/v1d';

    //constructing loan body

    //<editor-fold defaultstate="collapsed" desc="Collateral String">
    var collateralJsonString =
            '[{"' +
            'index":"' + '0' + '"' +
            ',"type":"' + $('#loanClientCerditCT').val() + '"' +
            ',"description":"' + "" + '"' +
            ',"value":"' + $('#loanClientCerditCTV').val() + '"' +
            '}]';

    var collatoralJsonLine = "";

    if (document.getElementById("loanClientCerditCT").value !== "UNSECURED" && document.getElementById("loanClientCerditCT").value !== "")
    {
        collatoralJsonLine = ',"creditCollaterals":' + collateralJsonString + '';
    }
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="Guarantor String">
    var guarantorJsonString =
            '{"' +
            'guarantorName":"' + $('#loanClientGuarantorName').val() + '"' +
            ',"guarantorValue":"' + $('#loanClientGuarantorIncome').val() + '"' +
            '}';

    var guarantorJsonLine = '';

    if (document.getElementById("loanClientHaveGuarantor").value === "YES")
    {
        guarantorJsonLine = ',"guarantor":' + guarantorJsonString + '';
    }
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="Employed">
    var clientEmplAddressJsonString =
            '{"' +
            'province":"' + $('#loanClientEmpProvince').val() + '"' +
            ',"city":"' + $('#loanClientEmpCity').val() + '"' +
            ',"street":"' + $('#loanClientEmpStreet').val() + '"' +
            '}';

    var clientEmploymentJsonString =
            '{"' +
            'employmentType":"' + 'EMPLOYED' + '"' +
            ',"startDate":"' + loanEmpStartDate + '"' +
            ',"monthlyIncome":"' + $('#loanClientEmpMonIncome').val() + '"' +
            ',"formallyRegistered":"' + $('#loanClientEmpFoRe').val() + '"' +
            ',"numberOfEmployees":"' + $('#loanClientEmpNOE').val() + '"' +
            ',"address":' + clientEmplAddressJsonString + '' +
            ',"businessSector":"' + $('#loanClientEmpSector').val() + '"' +
            ',"sector":"' + 'BUSINESS_SECTOR' + '"' +
            ',"awamoId":"' + $('#loanClientAwamoId').val() + '"' +
            ',"name":"' + $('#loanClientEmpCompanyName').val() + '"' +
            '}';
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="SelfEmplyed">
    var clientSelfEmplAddressJsonString =
            '{"' +
            'province":"' + $('#loanClientSelfEmpProvince').val() + '"' +
            ',"city":"' + $('#loanClientSelfEmpCity').val() + '"' +
            ',"street":"' + $('#loanClientSelfEmpStreet').val() + '"' +
            '}';

    var selfEmplymentSecotrLine = "";

    if (document.getElementById("loanClientSelfEmpType").value === "FARMER")
    {
        selfEmplymentSecotrLine = ',"agriculturalSector":"' + $('#loanClientSelfEmpAPro').val() + '"';
    }

    if (document.getElementById("loanClientSelfEmpType").value === "OTHER")
    {
        selfEmplymentSecotrLine = ',"businessSector":"' + $('#loanClientSelfEmpBSector').val() + '"';
    }

    var clientSelfEmploymentJsonString =
            '{"' +
            'employmentType":"' + 'SELF_EMPLOYED' + '"' +
            ',"selfEmploymentType":"' + $('#loanClientSelfEmpType').val() + '"' +
            ',"startDate":"' + loanSelfEmpStartDate + '"' +
            ',"monthlyIncome":"' + $('#loanClientSelfEmpMonIncome').val() + '"' +
            ',"formallyRegistered":"' + $('#loanClientSelfEmpFoRe').val() + '"' +
            ',"numberOfEmployees":"' + $('#loanClientSelfEmpNOE').val() + '"' +
            ',"address":' + clientSelfEmplAddressJsonString + '' +
            selfEmplymentSecotrLine +
            ',"awamoId":"' + $('#loanClientAwamoId').val() + '"' +
            ',"name":"' + $('#loanClientSelfEmpCompanyName').val() + '"' +
            '}';
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="Employments line">
    var empLineJsonString = '';

    if (document.getElementById("loanClientSelfEmployed").value === "YES" && document.getElementById("loanClientEmployed").value === "YES") {
        empLineJsonString = ',"clientEmployments":' + "[" + clientSelfEmploymentJsonString + "," + clientEmploymentJsonString + "]";
    } else {
        if (document.getElementById("loanClientSelfEmployed").value === "YES") {
            empLineJsonString = ',"clientEmployments":' + "[" + clientSelfEmploymentJsonString + "]";
        }

        if (document.getElementById("loanClientEmployed").value === "YES") {
            empLineJsonString = ',"clientEmployments":' + "[" + clientEmploymentJsonString + "]";
        }
    }
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="Loan Clients">
    var clientAddressJsonString =
            '{"' +
            'province":"' + $('#loanClientProvince').val() + '"' +
            ',"city":"' + $('#loanClientCity').val() + '"' +
            ',"street":"' + $('#loanClientStreet').val() + '"' +
            '}';


    var loanClientsJsonString =
            '[{"' +
            'awamoId":"' + $('#loanClientAwamoId').val() + '"' +
            ',"numberOfChildren":"' + $('#loanClientNOC').val() + '"' +
            ',"numberOfChildrenInHouseHold":"' + $('#loanClientFirstNOCIH').val() + '"' +
            ',"maritalStatus":"' + $('#loanClientMartialStatus').val() + '"' +
            ',"livingArea":"' + $('#loanClientLivingArea').val() + '"' +
            ',"address":' + clientAddressJsonString + '' +
            guarantorJsonLine +
            empLineJsonString +
            '}]';
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="Calculate Duration">
    var calculatedDuration = $('#loanClientDuration').val();

    if ($('#loanClientDuTy').val() === "WEEKS") {
        calculatedDuration = calculatedDuration * 7;
    }

    if ($('#loanClientDuTy').val() === "MONTHS") {
        calculatedDuration = calculatedDuration * 30;
    }

    if ($('#loanClientDuTy').val() === "YEARS") {
        calculatedDuration = calculatedDuration * 365;
    }
    //</editor-fold>

    var currentTime = new Date().getTime();

    var body = '{"' +
            'awamoId":"' + $('#loanClientAwamoId').val() + '"' +
            ',"numberOfRepayments":"' + $('#loanClientNORe').val() + '"' +
            ',"amortizationType":"' + $('#loanClientAmortizationType').val() + '"' +
            ',"interestCalculationPeriodType":"' + $('#loanClientICPT').val() + '"' +
            ',"reason":"' + $('#loanClientReason').val() + '"' +
            ',"interestType":"' + $('#loanClientInType').val() + '"' +
            ',"disbursementDate":"' + loanDisDate + '"' +
            ',"submitDate":"' + currentTime + '"' +
            ',"loanType":"' + "INDIVIDUAL" + '"' +
            ',"interestRate":"' + $('#loanClientAIR').val() + '000' + '"' +
            ',"principal":"' + $('#loanClientPrincipal').val() + '00' + '"' +
            ',"duration":"' + calculatedDuration + '"' +
            ',"loanClients":' + loanClientsJsonString + '' +
            collatoralJsonLine +
            ',"loanOfficer":"' + user.fullname + '"' +
            '}';

    $.ajax({
        url: host + uri,
        type: 'POST',
        data: body,
        headers: getAuthenticationHeader(),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        beforeSend: function () {
            $body = $("body");
            $body.addClass("loading");
            //$body.removeClass("loading");
        },
        success: function (data) {
            Options.prototype.loanCreationPassed();

        },
        complete: function () {
            $body = $("body");
            //$body.addClass("loading");
            $body.removeClass("loading");
        }
    }).fail(function (Response) {
        console.log(Response);
        message(
                'Warning',
                " Loan Application creation failed, please contact the support",
                MessageType.WARNING);
        $('html, body').animate({scrollTop: document.body.scrollHeight}, 'fast');
    });


};

//loan disbursement
Options.prototype.initLoanDisbursementPage = function () {


    document.getElementById("disburseLoanPaymentType").disabled = false;
    document.getElementById("disburseLoanAccountName").disabled = true;
    document.getElementById("disburseLoanPhoneNumber").disabled = true;
    document.getElementById("disburseLoanBankBranch").disabled = true;
    document.getElementById("disburseLoanChequeNumber").disabled = true;
    document.getElementById("disburseLoanAccountNumber").disabled = true;
    document.getElementById("disburseLoanBankName").disabled = true;

    document.getElementById("disburseLoanPaymentType").value = "";
    document.getElementById("disburseLoanAccountName").value = "";
    document.getElementById("disburseLoanPhoneNumber").value = "";
    document.getElementById("disburseLoanBankBranch").value = "";
    document.getElementById("disburseLoanChequeNumber").value = "";
    document.getElementById("disburseLoanAccountNumber").value = "";
    document.getElementById("disburseLoanBankName").value = "";

    document.getElementById("disburseLoanPaymentType").required = true;
    document.getElementById("disburseLoanAccountName").required = false;
    document.getElementById("disburseLoanPhoneNumber").required = false;
    document.getElementById("disburseLoanBankBranch").required = false;
    document.getElementById("disburseLoanChequeNumber").required = false;
    document.getElementById("disburseLoanAccountNumber").required = false;
    document.getElementById("disburseLoanBankName").required = false;

    $("#disburseLoanDisburseBottom").show();
    $("#confirmLoanDisburseBottom").hide();
    $("#modifyLoanDisburseBottom").hide();

    showContent($('#disburseLoanPanal'));
};

Options.prototype.loanDisbursePaymentType = function () {

    document.getElementById("disburseLoanAccountName").required = false;
    document.getElementById("disburseLoanAccountName").disabled = true;
    document.getElementById("disburseLoanAccountName").value = "";

    document.getElementById("disburseLoanPhoneNumber").required = false;
    document.getElementById("disburseLoanPhoneNumber").disabled = true;
    document.getElementById("disburseLoanPhoneNumber").value = "";

    document.getElementById("disburseLoanBankBranch").required = false;
    document.getElementById("disburseLoanBankBranch").disabled = true;
    document.getElementById("disburseLoanBankBranch").value = "";

    document.getElementById("disburseLoanChequeNumber").required = false;
    document.getElementById("disburseLoanChequeNumber").disabled = true;
    document.getElementById("disburseLoanChequeNumber").value = "";

    document.getElementById("disburseLoanAccountNumber").required = false;
    document.getElementById("disburseLoanAccountNumber").disabled = true;
    document.getElementById("disburseLoanAccountNumber").value = "";

    document.getElementById("disburseLoanBankName").required = false;
    document.getElementById("disburseLoanBankName").disabled = true;
    document.getElementById("disburseLoanBankName").value = "";

    if (document.getElementById("disburseLoanPaymentType").value === "CHEQUE") {

        document.getElementById("disburseLoanChequeNumber").required = true;
        document.getElementById("disburseLoanChequeNumber").disabled = false;
    }

    if (document.getElementById("disburseLoanPaymentType").value === "MOBILE_MONEY") {

        document.getElementById("disburseLoanPhoneNumber").required = true;
        document.getElementById("disburseLoanPhoneNumber").disabled = false;

        document.getElementById("disburseLoanAccountName").required = true;
        document.getElementById("disburseLoanAccountName").disabled = false;
    }

    if (document.getElementById("disburseLoanPaymentType").value === "BANK_TRANSFER") {

        document.getElementById("disburseLoanAccountName").required = true;
        document.getElementById("disburseLoanAccountName").disabled = false;

        document.getElementById("disburseLoanBankBranch").required = true;
        document.getElementById("disburseLoanBankBranch").disabled = false;

        document.getElementById("disburseLoanAccountNumber").required = true;
        document.getElementById("disburseLoanAccountNumber").disabled = false;

        document.getElementById("disburseLoanBankName").required = true;
        document.getElementById("disburseLoanBankName").disabled = false;
    }
};

Options.prototype.toLoanDisbursementConfirmPage = function () {

    if (
            //client data
            document.getElementById("disburseLoanBankName").checkValidity() &&
            document.getElementById("disburseLoanAccountNumber").checkValidity() &&
            document.getElementById("disburseLoanBankBranch").checkValidity() &&
            document.getElementById("disburseLoanAccountName").checkValidity() &&
            document.getElementById("disburseLoanPaymentType").checkValidity() &&
            document.getElementById("disburseLoanChequeNumber").checkValidity() &&
            document.getElementById("disburseLoanPhoneNumber").checkValidity()
            )
    {
        //addHistory('create accounting entry', '#createAccountingEntry', getSidebarSubitemSelector('accounting', 'Accounting', 'create'));

        document.getElementById("disburseLoanBankName").disabled = true;
        document.getElementById("disburseLoanAccountNumber").disabled = true;
        document.getElementById("disburseLoanBankBranch").disabled = true;
        document.getElementById("disburseLoanAccountName").disabled = true;
        document.getElementById("disburseLoanPaymentType").disabled = true;
        document.getElementById("disburseLoanChequeNumber").disabled = true;
        document.getElementById("disburseLoanPhoneNumber").disabled = true;



        $("#disburseLoanDisburseBottom").hide();
        $("#confirmLoanDisburseBottom").show();
        $("#modifyLoanDisburseBottom").show();

        showContent($('#disburseLoanPanal'));
    }

};

Options.prototype.modifyDisbursementLoanFields = function () {

    showContent($('#disburseLoanPanal'));

    document.getElementById("disburseLoanBankName").disabled = true;
    document.getElementById("disburseLoanAccountNumber").disabled = true;
    document.getElementById("disburseLoanBankBranch").disabled = true;
    document.getElementById("disburseLoanAccountName").disabled = true;
    document.getElementById("disburseLoanPaymentType").disabled = false;
    document.getElementById("disburseLoanChequeNumber").disabled = true;
    document.getElementById("disburseLoanPhoneNumber").disabled = true;

    if (document.getElementById("disburseLoanPaymentType").value === "CHEQUE") {

        document.getElementById("disburseLoanChequeNumber").disabled = false;
    }

    if (document.getElementById("disburseLoanPaymentType").value === "MOBILE_MONEY") {

        document.getElementById("disburseLoanPhoneNumber").disabled = false;

        document.getElementById("disburseLoanAccountName").disabled = false;
    }

    if (document.getElementById("disburseLoanPaymentType").value === "BANK_TRANSFER") {

        document.getElementById("disburseLoanAccountName").disabled = false;

        document.getElementById("disburseLoanBankBranch").disabled = false;

        document.getElementById("disburseLoanAccountNumber").disabled = false;

        document.getElementById("disburseLoanBankName").disabled = false;
    }

    $("#disburseLoanDisburseBottom").show();
    $("#confirmLoanDisburseBottom").hide();
    $("#modifyLoanDisburseBottom").hide();
};

Options.prototype.loanDisbursementPassed = function () {
    showContent($('#disburseLoanPanal'));

    $("#disburseLoanDisburseBottom").hide();
    $("#confirmLoanDisburseBottom").hide();
    $("#modifyLoanDisburseBottom").hide();

    message('Success',
            'The loan has been successfully disbursed',
            MessageType.SUCCESS);
    $('html, body').animate({scrollTop: document.body.scrollHeight}, 'fast');
};

Options.prototype.submitDisbursementData = function () {

    var uri = '/loan/v1d/' + LoanHandler.self.loan.loanId + '/disburse';

    //constructing loan body

    //<editor-fold defaultstate="collapsed" desc="chequeNumberJsonLine">
    var chequeNumberJsonLine = '';
    if (document.getElementById("disburseLoanPaymentType").value === "CHEQUE")
    {
        chequeNumberJsonLine = ',"chequeNumber":"' + document.getElementById("disburseLoanChequeNumber").value + '"';
    }
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="accountNameJsonLine">
    var accountNameJsonLine = '';
    if (document.getElementById("disburseLoanPaymentType").value === "MOBILE_MONEY" || document.getElementById("disburseLoanPaymentType").value === "BANK_TRANSFER")
    {
        accountNameJsonLine = ',"accountName":"' + document.getElementById("disburseLoanAccountName").value + '"';
    }
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="accountNumberJsonLine">
    var accountNumberJsonLine = '';
    if (document.getElementById("disburseLoanPaymentType").value === "BANK_TRANSFER")
    {
        accountNumberJsonLine = ',"accountNumber":"' + document.getElementById("disburseLoanAccountNumber").value + '"';
    }
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="phoneNumberJsonLine">
    var phoneNumberJsonLine = '';
    if (document.getElementById("disburseLoanPaymentType").value === "MOBILE_MONEY")
    {
        phoneNumberJsonLine = ',"phoneNumber":"' + document.getElementById("disburseLoanPhoneNumber").value + '"';
    }
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="bankNameJsonLine">
    var bankNameJsonLine = '';
    if (document.getElementById("disburseLoanPaymentType").value === "BANK_TRANSFER")
    {
        bankNameJsonLine = ',"bankName":"' + document.getElementById("disburseLoanBankName").value + '"';
    }
    //</editor-fold>
    
    //<editor-fold defaultstate="collapsed" desc="bankNameJsonLine">
    var bankBranchJsonLine = '';
    if (document.getElementById("disburseLoanPaymentType").value === "BANK_TRANSFER")
    {
        bankBranchJsonLine = ',"bankBranch":"' + document.getElementById("disburseLoanBankBranch").value + '"';
    }
    //</editor-fold>

    var body = '{"' +
            'paymentType":"' + $('#disburseLoanPaymentType').val() + '"' +
            chequeNumberJsonLine +
            accountNameJsonLine +
            accountNumberJsonLine +
            phoneNumberJsonLine +
            bankNameJsonLine +
            bankBranchJsonLine +
            '}';

    $.ajax({
        url: host + uri,
        type: 'POST',
        data: body,
        headers: getAuthenticationHeader(),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        beforeSend: function () {
            $body = $("body");
            $body.addClass("loading");
            //$body.removeClass("loading");
        },
        success: function (data) {
            Options.prototype.loanDisbursementPassed();

        },
        complete: function () {
            $body = $("body");
            //$body.addClass("loading");
            $body.removeClass("loading");
        }
    }).fail(function (Response) {
        console.log(Response);
        message(
                'Warning',
                " Loan disbursement failed, please contact the support",
                MessageType.WARNING);
        $('html, body').animate({scrollTop: document.body.scrollHeight}, 'fast');
    });


};