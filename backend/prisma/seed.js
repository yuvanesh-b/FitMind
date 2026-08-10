"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const exercises = [
    // CHEST
    {
        name: 'Bench Press',
        muscleGroup: client_1.MuscleGroup.CHEST,
        equipment: client_1.EquipmentType.BARBELL,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Classic compound exercise targeting the pectoralis major, anterior deltoids, and triceps.',
        instructions: 'Lie on bench, unrack barbell with medium grip width, lower smoothly to mid-chest, press up explosively until arms are extended.'
    },
    {
        name: 'Incline Dumbbell Press',
        muscleGroup: client_1.MuscleGroup.CHEST,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Targets upper chest and shoulders using an incline bench.',
        instructions: 'Set bench to 30-45 degrees, press dumbbells upward from chest height until arms are fully extended overhead.'
    },
    {
        name: 'Push Ups',
        muscleGroup: client_1.MuscleGroup.CHEST,
        equipment: client_1.EquipmentType.BODYWEIGHT,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Fundamental chest and core exercise requiring no equipment.',
        instructions: 'Place hands shoulder-width apart, lower body until chest nearly touches floor, press up maintaining straight line from head to heels.'
    },
    {
        name: 'Cable Fly',
        muscleGroup: client_1.MuscleGroup.CHEST,
        equipment: client_1.EquipmentType.CABLE,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Isolation chest movement providing continuous cable tension throughout motion.',
        instructions: 'Stand between cable handles set at chest height, bring hands together in wide hugging arc, squeeze chest at peak contraction.'
    },
    {
        name: 'Dumbbell Chest Fly',
        muscleGroup: client_1.MuscleGroup.CHEST,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Flat bench dumbbell fly for chest stretching and inner pec emphasis.',
        instructions: 'Lie flat with dumbbells above chest, lower arms in wide arc with slight elbow bend, squeeze pecs to return.'
    },
    // BACK
    {
        name: 'Barbell Row',
        muscleGroup: client_1.MuscleGroup.BACK,
        equipment: client_1.EquipmentType.BARBELL,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Bent-over row targeting latissimus dorsi, rhomboids, and lower back stability.',
        instructions: 'Hinge at hips to 45 degrees, pull barbell to lower chest/abdomen, keep spine neutral and squeeze shoulder blades.'
    },
    {
        name: 'Pull Ups',
        muscleGroup: client_1.MuscleGroup.BACK,
        equipment: client_1.EquipmentType.BODYWEIGHT,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Bodyweight vertical pulling exercise for upper back width and lats.',
        instructions: 'Grasp pull-up bar with overhand grip wider than shoulders, pull chin over bar, lower with control.'
    },
    {
        name: 'Lat Pulldown',
        muscleGroup: client_1.MuscleGroup.BACK,
        equipment: client_1.EquipmentType.CABLE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Cable vertical pull targeting upper lats and rear delts.',
        instructions: 'Sit facing pulldown machine, pull wide bar down to upper chest while leaning slightly back, release with full lat stretch.'
    },
    {
        name: 'Seated Cable Row',
        muscleGroup: client_1.MuscleGroup.BACK,
        equipment: client_1.EquipmentType.CABLE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Horizontal cable pull for mid-back thickness.',
        instructions: 'Sit upright on row machine, pull V-bar to lower ribs, retract scapulae, lower weight smoothly.'
    },
    {
        name: 'Single Arm Dumbbell Row',
        muscleGroup: client_1.MuscleGroup.BACK,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Unilateral back exercise improving strength balance.',
        instructions: 'Support knee and hand on flat bench, pull dumbbell up to hip, keeping torso stationary.'
    },
    // LEGS - QUADS, HAMSTRINGS, GLUTES, CALVES
    {
        name: 'Barbell Squat',
        muscleGroup: client_1.MuscleGroup.QUADS,
        equipment: client_1.EquipmentType.BARBELL,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'King of leg exercises targeting quads, glutes, hamstrings, and core.',
        instructions: 'Rest bar on upper traps, feet shoulder-width, squat down until thighs are parallel to floor, drive through heels to stand.'
    },
    {
        name: 'Leg Press',
        muscleGroup: client_1.MuscleGroup.QUADS,
        equipment: client_1.EquipmentType.MACHINE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Heavy leg machine exercise allowing high quad load with back support.',
        instructions: 'Place feet shoulder-width on footplate, release safety, lower plate until knees form 90 degrees, press back up without locking knees.'
    },
    {
        name: 'Romanian Deadlift',
        muscleGroup: client_1.MuscleGroup.HAMSTRINGS,
        equipment: client_1.EquipmentType.BARBELL,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Posterior chain builder focusing on hamstrings and glute stretch.',
        instructions: 'Stand tall with barbell, hinge back at hips keeping knees slightly soft, lower bar along shins until hamstring stretch, drive hips forward to return.'
    },
    {
        name: 'Leg Curl',
        muscleGroup: client_1.MuscleGroup.HAMSTRINGS,
        equipment: client_1.EquipmentType.MACHINE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Isolated hamstring machine flex.',
        instructions: 'Lie prone or sit in machine, flex knees to pull pad toward glutes, pause, return smoothly.'
    },
    {
        name: 'Leg Extension',
        muscleGroup: client_1.MuscleGroup.QUADS,
        equipment: client_1.EquipmentType.MACHINE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Isolated quad extension exercise.',
        instructions: 'Sit in machine with pad over lower shins, extend knees to lift weight, squeeze quads at top.'
    },
    {
        name: 'Walking Lunges',
        muscleGroup: client_1.MuscleGroup.GLUTES,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Dynamic lower body exercise building balance, glute and quad power.',
        instructions: 'Step forward into lunge until back knee nearly touches ground, push off front heel to step directly into next lunge.'
    },
    {
        name: 'Standing Calf Raise',
        muscleGroup: client_1.MuscleGroup.CALVES,
        equipment: client_1.EquipmentType.MACHINE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Gastrocnemius calf builder.',
        instructions: 'Place balls of feet on step edge, lower heels down for full stretch, push up onto toes as high as possible.'
    },
    // SHOULDERS
    {
        name: 'Overhead Shoulder Press',
        muscleGroup: client_1.MuscleGroup.SHOULDERS,
        equipment: client_1.EquipmentType.BARBELL,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Compound shoulder press building lateral and anterior deltoids.',
        instructions: 'Stand or sit, press barbell from collarbone to overhead lockout, core locked.'
    },
    {
        name: 'Dumbbell Lateral Raise',
        muscleGroup: client_1.MuscleGroup.SHOULDERS,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Isolated side deltoid exercise for shoulder width.',
        instructions: 'Stand upright with dumbbells at sides, raise arms out sideways to shoulder level with elbows slightly bent.'
    },
    {
        name: 'Face Pull',
        muscleGroup: client_1.MuscleGroup.SHOULDERS,
        equipment: client_1.EquipmentType.CABLE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Essential rear delt and rotator cuff posture exercise.',
        instructions: 'Attach rope handle to high cable, pull towards face while spreading rope handles apart, external rotating hands.'
    },
    {
        name: 'Dumbbell Front Raise',
        muscleGroup: client_1.MuscleGroup.SHOULDERS,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Anterior deltoid isolated raise.',
        instructions: 'Raise dumbbell in front of body to shoulder level, lower with controlled cadence.'
    },
    // BICEPS & TRICEPS
    {
        name: 'Barbell Curl',
        muscleGroup: client_1.MuscleGroup.BICEPS,
        equipment: client_1.EquipmentType.BARBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Classic biceps builder.',
        instructions: 'Stand holding barbell with underhand grip, curl bar toward shoulders keeping elbows pinned at sides.'
    },
    {
        name: 'Dumbbell Hammer Curl',
        muscleGroup: client_1.MuscleGroup.BICEPS,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Neutral-grip arm exercise targeting brachialis and forearms.',
        instructions: 'Hold dumbbells with palms facing each other, curl up without swinging elbows.'
    },
    {
        name: 'Incline Dumbbell Curl',
        muscleGroup: client_1.MuscleGroup.BICEPS,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Long-head bicep stretch curl on incline bench.',
        instructions: 'Sit back on 45-degree incline bench, let arms hang down, curl dumbbells upward maintaining back contact.'
    },
    {
        name: 'Tricep Pushdown',
        muscleGroup: client_1.MuscleGroup.TRICEPS,
        equipment: client_1.EquipmentType.CABLE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Cable pushdown targeting tricep lateral and medial heads.',
        instructions: 'Grasp rope or bar attached to high cable, push down until elbows locked, squeeze triceps.'
    },
    {
        name: 'Skull Crushers',
        muscleGroup: client_1.MuscleGroup.TRICEPS,
        equipment: client_1.EquipmentType.BARBELL,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Lying tricep extension behind head with EZ-bar.',
        instructions: 'Lie on flat bench, hold EZ-bar above shoulders, hinge at elbows to lower bar toward forehead, press back to start.'
    },
    {
        name: 'Overhead Dumbbell Tricep Extension',
        muscleGroup: client_1.MuscleGroup.TRICEPS,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Long-head tricep extension behind head.',
        instructions: 'Hold dumbbell vertically overhead with both hands, lower behind head, press back overhead.'
    },
    // CORE
    {
        name: 'Plank',
        muscleGroup: client_1.MuscleGroup.CORE,
        equipment: client_1.EquipmentType.BODYWEIGHT,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Isometric core stability hold.',
        instructions: 'Support body on forearms and toes, keep body straight from head to heels, engage abdominal muscles.'
    },
    {
        name: 'Hanging Leg Raise',
        muscleGroup: client_1.MuscleGroup.CORE,
        equipment: client_1.EquipmentType.BODYWEIGHT,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Lower abdominal and hip flexor builder.',
        instructions: 'Hang from pull-up bar, lift straight or bent knees up to chest level without swinging body.'
    },
    {
        name: 'Cable Woodchopper',
        muscleGroup: client_1.MuscleGroup.CORE,
        equipment: client_1.EquipmentType.CABLE,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Rotational oblique exercise.',
        instructions: 'Grasp cable handle high, rotate torso downward across body to opposite hip.'
    },
    {
        name: 'Ab Wheel Rollout',
        muscleGroup: client_1.MuscleGroup.CORE,
        equipment: client_1.EquipmentType.BODYWEIGHT,
        difficulty: client_1.FitnessLevel.ADVANCED,
        description: 'Intense anti-extension core rollout.',
        instructions: 'Kneel holding ab wheel, roll forward reaching arms out while keeping spine straight, pull back with abdominals.'
    },
    // CARDIO & FULL BODY
    {
        name: 'Treadmill Running',
        muscleGroup: client_1.MuscleGroup.CARDIO,
        equipment: client_1.EquipmentType.MACHINE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Cardiovascular endurance running.',
        instructions: 'Maintain consistent pace on treadmill incline or flat speed for target duration.'
    },
    {
        name: 'Stationary Cycling',
        muscleGroup: client_1.MuscleGroup.CARDIO,
        equipment: client_1.EquipmentType.MACHINE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Low-impact cardiovascular cycling.',
        instructions: 'Adjust seat height, maintain target RPM and resistance level.'
    },
    {
        name: 'Kettlebell Swings',
        muscleGroup: client_1.MuscleGroup.FULL_BODY,
        equipment: client_1.EquipmentType.KETTLEBELL,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Explosive hip hinge conditioning exercise.',
        instructions: 'Hinge hips back carrying kettlebell between legs, snap hips forward to swing bell to chest level.'
    },
    {
        name: 'Burpees',
        muscleGroup: client_1.MuscleGroup.FULL_BODY,
        equipment: client_1.EquipmentType.BODYWEIGHT,
        difficulty: client_1.FitnessLevel.INTERMEDIATE,
        description: 'Full body high-intensity conditioning movement.',
        instructions: 'Drop from standing to pushup position, execute pushup, jump feet in and explode upward into jump.'
    },
    {
        name: 'Dumbbell Goblet Squat',
        muscleGroup: client_1.MuscleGroup.QUADS,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Front-loaded dumbbell squat for deep posture.',
        instructions: 'Hold single heavy dumbbell vertically against chest, squat deep between knees, stand up.'
    },
    {
        name: 'Dumbbell Shoulder Press',
        muscleGroup: client_1.MuscleGroup.SHOULDERS,
        equipment: client_1.EquipmentType.DUMBBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Seated overhead press for shoulder strength.',
        instructions: 'Sit upright, press dumbbells overhead from ear level to full arm extension.'
    },
    {
        name: 'Lat Cable Row',
        muscleGroup: client_1.MuscleGroup.BACK,
        equipment: client_1.EquipmentType.CABLE,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Cable seated row with wide grip.',
        instructions: 'Sit at cable station, pull wide bar to upper stomach keeping chest lifted.'
    },
    {
        name: 'Jump Rope',
        muscleGroup: client_1.MuscleGroup.CARDIO,
        equipment: client_1.EquipmentType.BODYWEIGHT,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'High frequency footwork and cardio exercise.',
        instructions: 'Jump lightly on balls of feet as rope passes beneath, maintaining rhythm.'
    },
    {
        name: 'Barbell Shrugs',
        muscleGroup: client_1.MuscleGroup.SHOULDERS,
        equipment: client_1.EquipmentType.BARBELL,
        difficulty: client_1.FitnessLevel.BEGINNER,
        description: 'Trap isolation shrug.',
        instructions: 'Hold heavy barbell in front, elevate shoulders toward ears, pause at top, lower slowly.'
    }
];
async function main() {
    console.log('Seeding 40+ exercises into database...');
    for (const ex of exercises) {
        await prisma.exercise.upsert({
            where: { name: ex.name },
            update: ex,
            create: ex,
        });
    }
    console.log('Exercise seeding complete!');
}
main()
    .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
