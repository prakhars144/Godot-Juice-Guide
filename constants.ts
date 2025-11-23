
import { Category, Section } from './types';

export const GODOT_BLUE = "#478cbf";

export const GUIDE_SECTIONS: Section[] = [
  {
    id: 'intro-what-is-juice',
    title: 'What is "Juice"?',
    category: Category.INTRO,
    content: `"Juice" (or Game Feel) is the non-essential feedback that makes a game feel alive. It's the difference between a dry spreadsheet calculation and a satisfying Mario jump.

**The Juice Manifesto:**
*   **Response**: Every input must have an immediate, tangible reaction.
*   **Exaggeration**: Real life is boring. Animation should be larger than life.
*   **Tactility**: UI and objects should feel physical, not digital.

In Godot 4.5+, adding juice is easier than ever thanks to the lightweight \`Tween\` system, compute shaders, and the new \`CPUParticles2D\` performance improvements.

*Use the demo below to see the difference between raw game logic (No Juice) and polished output (Juice Enabled).*`,
    demoType: 'intro'
  },
  {
    id: 'visual-squash-stretch',
    title: 'Squash & Stretch',
    category: Category.VISUALS,
    content: `Squash and stretch comes from traditional animation (think Disney). It gives objects a sense of **mass** and **flexibility**.

*   **Impact (Squash)**: When an object hits the floor, it compresses vertically and expands horizontally to conserve volume.
*   **Jump (Stretch)**: When moving fast or jumping, it elongates in the direction of travel.

**Implementation in Godot:**
Avoid using \`AnimationPlayer\` for procedural movement like this. Use \`create_tween()\` for dynamic, interruptible animation.`,
    codeSnippet: `func apply_squash_stretch(ratio: Vector2):
    # ratio example: Vector2(1.2, 0.8) for squash
    if tween: tween.kill() # Interrupt previous animation
    
    tween = create_tween()
    tween.set_trans(Tween.TRANS_ELASTIC)
    tween.set_ease(Tween.EASE_OUT)
    
    # 1. Snap to squash pose
    tween.tween_property($Sprite2D, "scale", ratio, 0.05)
    
    # 2. Return to normal
    tween.tween_property($Sprite2D, "scale", Vector2.ONE, 0.25)`,
    demoType: 'squash'
  },
  {
    id: 'visual-tilt',
    title: 'Procedural Tilt',
    category: Category.VISUALS,
    content: `When a character runs, they shouldn't remain perfectly upright. Leaning them forward based on their speed or acceleration adds a sense of weight and momentum.

This is a cheap, procedural effect that saves you from drawing unique "run start" or "skid stop" animation frames.

**The Formula:**
Rotate the sprite based on its X velocity. Use \`lerp\` (linear interpolation) to smooth the rotation so it doesn't jitter.`,
    codeSnippet: `extends Sprite2D

@export var lean_factor = 0.05
@export var speed = 10.0

func _process(delta):
    var velocity = owner.velocity # Assuming character parent
    
    # Calculate target angle based on speed
    var target_angle = velocity.x * lean_factor * delta
    
    # Smoothly rotate towards target
    rotation = lerp_angle(rotation, target_angle, speed * delta)`,
    demoType: 'tilt'
  },
  {
    id: 'visual-flash',
    title: 'Hit Flashing',
    category: Category.VISUALS,
    content: `When an enemy takes damage, a white flash provides the clearest possible feedback frame-one. 

**Do NOT** just toggle visibility. It looks like a glitch.
**Do NOT** use \`modulate\`. Modulate multiplies color, so you can't make a dark sprite white.

**The Solution: Shaders**
Use a simple fragment shader that mixes the texture color with pure white based on a uniform float.`,
    codeSnippet: `shader_type canvas_item;

uniform vec4 flash_color : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform float flash_modifier : hint_range(0.0, 1.0) = 0.0;

void fragment() {
    vec4 color = texture(TEXTURE, UV);
    // Mix original color with flash color based on modifier
    vec3 mixed_rgb = mix(color.rgb, flash_color.rgb, flash_modifier);
    COLOR = vec4(mixed_rgb, color.a);
}

// In GDScript:
func hit():
    var t = create_tween()
    (material as ShaderMaterial).set_shader_parameter("flash_modifier", 1.0)
    t.tween_method(
        func(v): (material as ShaderMaterial).set_shader_parameter("flash_modifier", v),
        1.0, 0.0, 0.15
    )`,
    demoType: 'flash'
  },
  {
    id: 'visual-particles',
    title: 'Explosive Particles',
    category: Category.VISUALS,
    content: `Good particles are the sprinkles on the donut of game design. In Godot 4, \`GPUParticles2D\` are extremely performant.

**Recipe for Impact Particles:**
*   **Explosiveness**: Set to \`1.0\`. All particles should burst instantly.
*   **Spread**: 180 degrees for impacts against walls, 360 for explosions.
*   **Initial Velocity**: High minimum and maximum variance.
*   **Damping**: Use damping so particles slow down quickly, simulating air resistance.`,
    codeSnippet: `func spawn_impact(pos: Vector2):
    var p = preload("res://ImpactParticles.tscn").instantiate()
    p.position = pos
    p.emitting = true
    get_tree().current_scene.add_child(p)
    
    # Auto-cleanup
    await p.finished
    p.queue_free()`,
    demoType: 'particles'
  },
  {
    id: 'visual-shockwave',
    title: 'Shockwave Distortion',
    category: Category.VISUALS,
    content: `For massive explosions, particles aren't enough. A distortion ring that expands and warps the background makes an impact feel physical—like a pressure wave moving through the air.

**Godot Implementation:**
This requires a \`BackBufferCopy\` node (to read the screen behind the object) and a shader using \`SCREEN_TEXTURE\`.

The shader calculates a displacement vector from the center of the UV and offsets the screen texture lookup.`,
    codeSnippet: `shader_type canvas_item;

uniform vec2 center = vec2(0.5, 0.5);
uniform float force = 0.05;
uniform float size = 0.0; // Animate this from 0.0 to 1.0
uniform float thickness = 0.1;

uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;

void fragment() {
    float ratio = SCREEN_PIXEL_SIZE.x / SCREEN_PIXEL_SIZE.y;
    vec2 scaled_uv = (SCREEN_UV - vec2(0.5, 0.0)) / vec2(ratio, 1.0) + vec2(0.5, 0.0);
    
    float mask = (1.0 - smoothstep(size - 0.1, size, length(scaled_uv - center))) * 
                 smoothstep(size - thickness - 0.1, size - thickness, length(scaled_uv - center));
    
    vec2 disp = normalize(scaled_uv - center) * force * mask;
    COLOR = texture(SCREEN_TEXTURE, SCREEN_UV - disp);
}`,
    demoType: 'shockwave'
  },
  {
    id: 'visual-ghost-trails',
    title: 'Ghost Trails',
    category: Category.VISUALS,
    content: `Ghost trails (or Afterimages) are essential for conveying high speed, dashes, or teleportation. They show the player *where they were* a fraction of a second ago, filling the visual gap during fast movement.

**How to implement:**
1.  Spawn a copy of the sprite at the current location.
2.  Set its color to a solid "energy" color or reduce alpha.
3.  Fade it out immediately using a Tween.`,
    codeSnippet: `func spawn_ghost():
    var ghost = $Sprite2D.duplicate()
    ghost.modulate = Color(0.5, 0.8, 1.0, 0.5) # Blue tint
    get_parent().add_child(ghost)
    ghost.global_position = global_position
    
    var t = create_tween()
    t.tween_property(ghost, "modulate:a", 0.0, 0.4)
    t.tween_callback(ghost.queue_free)`,
    demoType: 'ghost'
  },
  {
    id: 'visual-floating-text',
    title: 'Floating Text',
    category: Category.VISUALS,
    content: `Nothing says "progress" like big numbers flying off an enemy. Floating combat text confirms a hit and communicates damage value.

**Juice Tips:**
*   **Velocity**: Don't just float up. Give it a random horizontal velocity and gravity.
*   **Scaling**: Pop the text scale from 0 to 1.5, then settle at 1.0.
*   **Crit**: Make critical hits distinct colors and larger sizes.`,
    codeSnippet: `func spawn_text(value: int, pos: Vector2):
    var label = Label.new()
    label.text = str(value)
    label.position = pos
    # Center pivot for scaling
    label.pivot_offset = label.size / 2 
    add_child(label)
    
    # Animate Jump
    var t = create_tween().set_parallel(true)
    var end_pos = pos + Vector2(randf_range(-20, 20), -50)
    
    t.tween_property(label, "position", end_pos, 0.5).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CIRC)
    t.tween_property(label, "scale", Vector2.ZERO, 0.2).set_delay(0.4)
    t.chain().tween_callback(label.queue_free)`,
    demoType: 'text'
  },
  {
    id: 'visual-juicy-ui',
    title: 'Juicy UI',
    category: Category.VISUALS,
    content: `UI is often an afterthought, but it's what players interact with most. Juicy UI feels tactile and physical.

**The Button Feel Checklist:**
*   **Hover**: Scale up slightly (e.g., 1.1x) or wiggle.
*   **Click (Down)**: Squash the button down (e.g., 0.9x).
*   **Click (Up)**: Spring back to normal with an elastic tween.

Using \`pivot_offset\` is crucial here so the button scales from its center, not the top-left corner.`,
    codeSnippet: `func _on_button_mouse_entered():
    # Scale up on hover
    var t = create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
    t.tween_property(self, "scale", Vector2(1.1, 1.1), 0.2)

func _on_button_gui_input(event):
    if event is InputEventMouseButton:
        if event.pressed:
            # Squash on press
            var t = create_tween().set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
            t.tween_property(self, "scale", Vector2(0.9, 0.9), 0.1)
        else:
            # Release / Execute
            var t = create_tween().set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)
            t.tween_property(self, "scale", Vector2(1.1, 1.1), 0.3)
            # Do action...`,
    demoType: 'ui'
  },
  {
    id: 'visual-persistence',
    title: 'Persistence (Decals)',
    category: Category.VISUALS,
    content: `A game world feels fake if your actions disappear immediately. Persistence creates a history of the battle.

*   **Shell Casings**: Leave brass on the floor.
*   **Scorch Marks**: Use \`Decal\` nodes in 3D or Sprite overlays in 2D.
*   **Corpses**: Don't just delete enemies; switch them to a ragdoll state or a static "dead" sprite.

**Optimization Strategy:**
You cannot keep infinite objects. Use a "Pool" or a FIFO (First-In-First-Out) queue.`,
    codeSnippet: `const MAX_DEBRIS = 50
@onready var debris_container = $Debris

func spawn_blood(pos: Vector2):
    var sprite = Sprite2D.new()
    sprite.texture = blood_texture
    sprite.position = pos
    sprite.rotation = randf() * TAU
    
    debris_container.add_child(sprite)
    
    # If too many, delete oldest
    if debris_container.get_child_count() > MAX_DEBRIS:
        debris_container.get_child(0).queue_free()`,
    demoType: 'persistence'
  },
  {
    id: 'camera-screenshake',
    title: 'Screenshake',
    category: Category.CAMERA,
    content: `Screenshake conveys power. However, implementing it directly by setting random offsets looks jerky and amateur.

**The Trauma Method:**
1.  **Trauma**: A float (0.0 to 1.0) representing stress.
2.  **Decay**: Linearly decrease Trauma over time.
3.  **Shake**: The actual offset is \`Trauma²\` or \`Trauma³\`.

This ensures that small hits feel subtle, while big hits feel exponentially more powerful.`,
    codeSnippet: `extends Camera2D

@export var decay = 0.8
@export var max_offset = Vector2(100, 75)
@export var max_roll = 0.1
var trauma = 0.0

func add_trauma(amount):
    trauma = min(trauma + amount, 1.0)

func _process(delta):
    if trauma > 0:
        trauma = max(trauma - decay * delta, 0)
        shake()

func shake():
    var amount = pow(trauma, 2)
    offset.x = max_offset.x * amount * randf_range(-1, 1)
    offset.y = max_offset.y * amount * randf_range(-1, 1)
    rotation = max_roll * amount * randf_range(-1, 1)`,
    demoType: 'shake'
  },
  {
    id: 'camera-lookahead',
    title: 'Dynamic Lookahead',
    category: Category.CAMERA,
    content: `By default, keeping the player dead-center on screen can hide what's important: what's in front of them.

**Lookahead** shifts the camera in the direction the player is moving or aiming. It creates a sense of speed and gives the player more time to react to obstacles.

**Godot Implementation:**
Use \`Camera2D.position_smoothing_enabled\` for the base follow. Then, manually add an offset to the \`position\` or \`offset\` property based on velocity.`,
    codeSnippet: `extends Camera2D

@export var look_ahead_amount = 200.0
@export var shift_speed = 2.0

func _physics_process(delta):
    var player_vel = owner.velocity
    var target_offset = Vector2.ZERO
    
    # Only shift if moving significantly
    if player_vel.length() > 20.0:
        target_offset = player_vel.normalized() * look_ahead_amount
        
    # Smoothly move towards target offset
    offset = offset.lerp(target_offset, shift_speed * delta)`,
    demoType: 'lookahead'
  },
  {
    id: 'camera-freeze-frame',
    title: 'Hitstop (Freeze Frame)',
    category: Category.CAMERA,
    content: `Hitstop (or "Sleep") is a momentary pause when a significant impact occurs. It mimics the cinematic effect of a camera shutter struggling to capture fast motion.

**How it works:**
When a hit lands, set the engine timescale to 0.0 (or very low), wait for a tiny duration (e.g. 0.1s), then reset it.

*   **Light Attack**: 0.05s - 0.08s
*   **Heavy Attack**: 0.15s - 0.3s
*   **Kill Shot**: 0.5s + Zoom

This simple pause adds immense "crunch" to combat.`,
    codeSnippet: `func hit_stop(time_scale: float, duration: float):
    # Slow down time
    Engine.time_scale = time_scale
    
    # Create a timer that ignores the time scale
    await get_tree().create_timer(duration * time_scale, true, false, true).timeout
    
    # Restore time
    Engine.time_scale = 1.0`,
    demoType: 'hitstop'
  },
  {
    id: 'audio-pitch',
    title: 'Audio Variance',
    category: Category.AUDIO,
    content: `Your ears are excellent at detecting repetition. If a machine gun fires the exact same WAV file 10 times a second, it sounds like a glitch.

**Pitch Shifting:**
Randomizing the pitch by just ±10% (0.9 to 1.1) makes every shot sound unique.

In Godot 4.5, use the \`AudioStreamRandomizer\` resource. It allows you to add a stream and set "Random Pitch" and "Random Volume" directly in the inspector, with no code required.`,
    codeSnippet: `# Code approach (if not using AudioStreamRandomizer)
func play_sound(player: AudioStreamPlayer):
    player.pitch_scale = randf_range(0.9, 1.1)
    player.play()`,
    demoType: 'audio'
  },
  {
    id: 'input-coyote',
    title: 'Coyote Time',
    category: Category.INPUT,
    content: `Named after Wile E. Coyote, this feature allows players to jump for a few frames *after* walking off a ledge.

Without this, players will constantly feel like the game "ate" their jump input because human reaction time isn't frame-perfect.

**Implementation:**
When the player leaves the floor, start a short timer (e.g., 0.1s). Allow jumping as long as that timer is > 0.`,
    codeSnippet: `var coyote_timer = 0.0

func _physics_process(delta):
    var was_on_floor = is_on_floor()
    move_and_slide()
    
    # If we just walked off a ledge
    if was_on_floor and !is_on_floor() and velocity.y >= 0:
        coyote_timer = 0.1
    else:
        coyote_timer -= delta
        
    if Input.is_action_just_pressed("jump"):
        if is_on_floor() or coyote_timer > 0:
            velocity.y = JUMP_FORCE
            coyote_timer = 0.0 # Consume jump`,
    demoType: 'coyote'
  },
  {
    id: 'input-buffer',
    title: 'Jump Buffering',
    category: Category.INPUT,
    content: `The opposite of Coyote Time. If a player presses jump *before* they hit the ground, remember that input and execute it the moment they land.

This makes movement feel fluid and responsive, rather than requiring frame-perfect timing to bunny hop.

**Implementation:**
Store a timestamp when the jump button is pressed. In your physics loop, if you land and the timestamp is recent (< 0.1s), execute the jump immediately.`,
    codeSnippet: `var jump_buffer_timer = 0.0

func _input(event):
    if event.is_action_pressed("jump"):
        jump_buffer_timer = 0.1

func _physics_process(delta):
    jump_buffer_timer -= delta
    
    if is_on_floor() and jump_buffer_timer > 0:
        velocity.y = JUMP_FORCE
        jump_buffer_timer = 0.0`,
    demoType: 'buffer'
  }
];
