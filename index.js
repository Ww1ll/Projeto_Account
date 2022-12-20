// modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

// modulos internos
const fs = require('fs')

operation()

function operation() {

    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Saque',
                'Sair'
            ],
        },
    ]).then((answer) => {
        const action = answer['action']

        if (action === 'Criar conta') {
            createAccount()
        } else if (action === 'Consultar saldo') {
            saldo()
        } else if (action === 'Depositar') {
            deposito()
        } else if (action === 'Saque') {
            saque()
        } else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit()
        }
    })
        .catch((err) => console.log(err))
}


//criando conta

function createAccount() {
    console.log(chalk.bgGreen.black('Obrigado por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    buildAccount()
}

function buildAccount() {

    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite um nome para a sua conta:'

    }]).then(answer => {
        const accountName = answer['accountName']

        console.info(accountName)

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'))
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance":0}', function (err) {
            console.log(err)
        })

        console.log(chalk.green('Parabéns, sua conta foi criada!'))
        operation()

    }).catch(err => console.log(err))
}


// Deposito

function deposito() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
        .then((answer => {
            const accountName = answer['accountName']

            if (!checarConta(accountName)) {
                return deposito()
            }

            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Quanto você gostaria de depositar?'
                }

            ]).then((answer) => {
                const amount = answer['amount']

                addQuantia(accountName, amount)
                operation()

            }).catch(err => console.log(err))

        }))
        .catch(err => console.log(err))
}

function checarConta(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Essa conta não existe!'))
        return false
    }
    return true
}

function addQuantia(accountName, amount) {

    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'))
        return deposito()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi realizado um depósito no valor R$${amount} na sua conta!`))

}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r',
    })

    return JSON.parse(accountJSON)

}

// Saldo da conta

function saldo() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {

        const accountName = answer["accountName"]

        if (!checarConta(accountName)) {
            return saldo()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é de R$${accountData.balance}`))
        operation()

    }).catch(err => console.log(err))
}

// Realizar saque

function saque() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) =>{
        const accountName = answer['accountName']

        if(!checarConta(accountName)){
            return saque()
        }
        
        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?',
            },

        ]).then((answer) => {

            const amount = answer['amount']

            removeAmount(accountName, amount)
            
        }).catch(err => console.log(err))

    }).catch(err => console.log(err))
}

function removeAmount(accountName, amount){

    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))

        return saque()
    }

    if(accountData.balance < amount){
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return saque()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err){
            console.log(err)
        },
    )

    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`))
    operation()
}