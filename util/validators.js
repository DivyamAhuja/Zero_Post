export const validateRegisterInput = (username, email, password, confirmPassword) => {
    const errors = {}
    if (username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if (email.trim() === '') {
        errors.email = 'Email must not be empty';
    } else {
        const emailRegEx = /^([0-9a-zA-Z]([-.\w]*@[0-9a-zA-Z][-.\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if(!email.match(emailRegEx)) {
            errors.email = 'Email must must be a valid email address';
        }
    }
    if (password.trim() == '') {
        errors.password = 'Password must not be empty'
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords must match'
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
}

export const validateLoginInput = (username, password) => {
    const errors = {};
    if (username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if (password.trim() == '') {
        errors.password = 'Password must not be empty'
    }
    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
}