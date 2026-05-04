
import { BadRequestException } from '../Common/index.js';
import { create } from '../DB/database.repository.js';
import { ActivityLog } from './../DB/Models/activity.model.js';

export const recordActivity = async(userId,action,resourceType,resourceId,details)=>{
    try {
        await create({
            model:ActivityLog,
            data:{
                user:userId,
                action,
                resourceId,
                details,
                resourceType
            }
        })
    } catch (error) {
        throw BadRequestException({
            message:"Can't save this activity",
            extra:error
        })
    }
}

// {
//   userId: '69f56ee7761bd65b8e312e2b',
//   action: 'joined_workspace',
//   resourceType: 'Workspace',
//   resourceId: '69f1419892171aa3a13c95fa',
//   details: { description: 'Joined workSpace1 workspace' }
// }
// ValidationError: ActivityLog validation failed: resourceId: Path `resourceId` is required., resourceType: Path `resourceType` is required., action: Path `action` is required., user: Path `user` is required.
//     at model.validate (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\document.js:2864:36)
//     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
//     at async model.$__save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:390:7)
//     at async model.save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:664:5)
//     at async E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2820:9
//     at async Promise.all (index 1)
//     at async model.create (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2805:11)
//     at async create (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/DB/database.repository.js:40:10)
//     at async recordActivity (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/Middleware/recordActivity.js:10:9)
//     at async Promise.all (index 1) {
//   errors: {
//     resourceId: ValidatorError: Path `resourceId` is required.
//         at SchemaObjectId.doValidate (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\schemaType.js:1432:13)
//         at model.validate (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\document.js:2842:20)
//         at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
//         at async model.$__save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:390:7)
//         at async model.save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:664:5)
//         at async E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2820:9
//         at async Promise.all (index 1)
//         at async model.create (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2805:11)
//         at async create (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/DB/database.repository.js:40:10)
//         at async recordActivity (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/Middleware/recordActivity.js:10:9) {
//       properties: [Object],
//       kind: 'required',
//       path: 'resourceId',
//       value: undefined,
//       reason: undefined,
//       Symbol(mongoose#validatorError): true
//     },
//     resourceType: ValidatorError: Path `resourceType` is required.
//         at SchemaString.doValidate (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\schemaType.js:1432:13)
//         at model.validate (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\document.js:2842:20)
//         at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
//         at async model.$__save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:390:7)
//         at async model.save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:664:5)
//         at async E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2820:9
//         at async Promise.all (index 1)
//         at async model.create (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2805:11)
//         at async create (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/DB/database.repository.js:40:10)
//         at async recordActivity (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/Middleware/recordActivity.js:10:9) {
//       properties: [Object],
//       kind: 'required',
//       path: 'resourceType',
//       value: undefined,
//       reason: undefined,
//       Symbol(mongoose#validatorError): true
//     },
//     action: ValidatorError: Path `action` is required.
//         at SchemaString.doValidate (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\schemaType.js:1432:13)
//         at model.validate (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\document.js:2842:20)
//         at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
//         at async model.$__save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:390:7)
//         at async model.save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:664:5)
//         at async E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2820:9
//         at async Promise.all (index 1)
//         at async model.create (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2805:11)
//         at async create (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/DB/database.repository.js:40:10)
//         at async recordActivity (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/Middleware/recordActivity.js:10:9) {
//       properties: [Object],
//       kind: 'required',
//       path: 'action',
//       value: undefined,
//       reason: undefined,
//       Symbol(mongoose#validatorError): true
//     },
//     user: ValidatorError: Path `user` is required.
//         at SchemaObjectId.doValidate (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\schemaType.js:1432:13)
//         at model.validate (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\document.js:2842:20)
//         at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
//         at async model.$__save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:390:7)
//         at async model.save (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:664:5)
//         at async E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2820:9
//         at async Promise.all (index 1)
//         at async model.create (E:\Web development\Depi\Back-end\Project-Management-system\node_modules\mongoose\lib\model.js:2805:11)
//         at async create (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/DB/database.repository.js:40:10)
//         at async recordActivity (file:///E:/Web%20development/Depi/Back-end/Project-Management-system/src/Middleware/recordActivity.js:10:9) {
//       properties: [Object],
//       kind: 'required',
//       path: 'user',
//       value: undefined,
//       reason: undefined,
//       Symbol(mongoose#validatorError): true
//     }
//   },
//   _message: 'ActivityLog validation failed'
// }