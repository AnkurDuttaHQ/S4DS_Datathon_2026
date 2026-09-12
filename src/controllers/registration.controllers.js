import {
    createRegistrationService
} from "../services/registration.services.js";

export const createRegistration = async (req, res) => {
    try {

        const result =
            await createRegistrationService(req.body);

        return res.status(201).json({
            success: true,

            message:
                "Registration submitted successfully",

            data: {
                registrationId:
                    result.registration.registrationId,

                teamName:
                    result.registration.team.name,

                fee:
                    result.registration.fee,

                status:
                    result.registration.status,

                paymentUrl:
                    result.paymentUrl
            }
        });

    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,

            message:
                error.message ||
                "Internal server error"
        });
    }
};