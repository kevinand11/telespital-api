import { AuthUseCases, AuthUsersUseCases, AuthUserType } from '@modules/auth'
import { Request, validate, Validation, ValidationError } from '@stranerd/api-commons'
import { generateAuthOutput, isValidPassword } from '@utils/modules/auth'
import { StorageUseCases } from '@modules/storage'

export class EmailsController {
	static async signup (req: Request) {
		const userCredential = {
			email: req.body.email ?? '',
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			password: req.body.password,
			photo: req.files.photo?.[0] ?? null,
			type: req.body.type
		}

		const user = await AuthUsersUseCases.findUserByEmail(userCredential.email)

		const isUniqueInDb = (_: string) => !user ? Validation.isValid() : Validation.isInvalid('email already in use')

		const {
			email, firstName, lastName,
			password, photo: userPhoto, type
		} = validate(userCredential, {
			email: { required: true, rules: [Validation.isEmail, isUniqueInDb] },
			password: { required: true, rules: [isValidPassword] },
			photo: { required: true, nullable: true, rules: [Validation.isNotTruncated, Validation.isImage] },
			firstName: { required: true, rules: [Validation.isString, Validation.isLongerThanOrEqualToX(2)] },
			lastName: { required: true, rules: [Validation.isString, Validation.isLongerThanOrEqualToX(2)] },
			type: {
				required: true,
				rules: [Validation.isString, Validation.arrayContainsX(Object.values(AuthUserType), (cur, val) => cur === val)]
			}
		})
		const photo = userPhoto ? await StorageUseCases.upload('profiles', userPhoto) : null
		const validateData = {
			name: { first: firstName, last: lastName },
			email, password, photo, type
		}

		const updatedUser = user
			? await AuthUsersUseCases.updateDetails({ userId: user.id, data: validateData })
			: await AuthUseCases.registerUser(validateData)

		return await generateAuthOutput(updatedUser)
	}

	static async signin (req: Request) {
		const validateData = validate({
			email: req.body.email,
			password: req.body.password
		}, {
			email: { required: true, rules: [Validation.isEmail] },
			password: { required: true, rules: [Validation.isString] }
		})

		const data = await AuthUseCases.authenticateUser(validateData)
		return await generateAuthOutput(data)
	}

	static async sendVerificationMail (req: Request) {
		const { email } = validate({
			email: req.body.email
		}, {
			email: { required: true, rules: [Validation.isEmail] }
		})

		const user = await AuthUsersUseCases.findUserByEmail(email)
		if (!user) throw new ValidationError([{ field: 'email', messages: ['No account with such email exists'] }])

		return await AuthUseCases.sendVerificationMail(user.email)
	}

	static async verifyEmail (req: Request) {
		const { token } = validate({
			token: req.body.token
		}, {
			token: { required: true, rules: [Validation.isString] }
		})

		const data = await AuthUseCases.verifyEmail(token)
		return await generateAuthOutput(data)
	}
}