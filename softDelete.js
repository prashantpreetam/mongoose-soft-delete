// mongoose plugin to handle soft delete

const softDelete = (schema, options) => {
    const deletedKey = 'deleted_at';

    schema.add({
        deleted_at: {
            type: Date,
            default: null,
            select: false
        }
    });

    const queryMethodsList = [
        'find',
        'findOne',
        'findMany',
        'findOneAndDelete',
        'findOneAndRemove',
        'findOneAndUpdate',
        'findOneAndReplace',
        'findById',
        'findByIdAndDelete',
        'findByIdAndRemove',
        'findByIdAndUpdate',
        'update',
        'updateOne',
        'updateMany',
        'deleteOne',
        'deleteMany',
        'replaceOne',
        'count'
    ];

    /* All Queries:

    Model.deleteMany()
    Model.deleteOne()
    Model.find()
    Model.findById()
    Model.findByIdAndDelete()
    Model.findByIdAndRemove()
    Model.findByIdAndUpdate()
    Model.findOne()
    Model.findOneAndDelete()
    Model.findOneAndRemove()
    Model.findOneAndReplace()
    Model.findOneAndUpdate()
    Model.replaceOne()
    Model.updateMany()
    Model.updateOne()

    */

    for(const method of queryMethodsList) {
        schema.pre(method, {query: true}, async function(next) {
            this.where({"deleted_at": null});
            next();
        });
    };

    schema.methods.softDelete = function(callback) {
        this.deleted_at = Date.now();
        this.save(callback);
    };

    schema.statics.softDelete = function (conditions, callback) {

        let doc = {};

        if (schema.path('deleted_at')) {
            doc.deleted_at = new Date();
        }
        
        return this.updateMany(conditions, doc, { multi: true }, callback);
        
    };

    const excludeInAggregation = async function (next) {
        this.pipeline().unshift({ $match: { deletedKey: null } });
        next();
    };

    schema.pre('aggregate', excludeInAggregation);

};

module.exports = softDelete;