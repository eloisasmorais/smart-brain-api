const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    
    const salt = 10;
    const hash = bcrypt.hashSync(password, salt);
    
    if(!email || !name || !password) {
        return res.status(400).json('Incorrect form submission');
    }
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date()
            })
            .then(user => {
                console.log(user[0])
                res.json(user[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback) 
    })
    .catch(err => res.status(400).json('Unable to register'));
}

module.exports = { 
    handleRegister: handleRegister
};