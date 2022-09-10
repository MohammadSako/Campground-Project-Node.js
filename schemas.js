//JOI Schema Validations: (449)
//this is not mongoose Schema..
//https://joi.dev/api/?v=17.6.0
//there is alot things you can do with JOI, see the page..

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//Sanitizing HTML w/ JOI: (568)
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
}); 

module.exports.reviewsSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(10),
        body: Joi.string().required().escapeHTML()
    }).required()
})