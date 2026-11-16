import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/Language'
import { marineLabels } from './labels'

/**
 * Visor de modelos 3D de Tripo.
 *
 * El motor 3D y el archivo GLB solo se descargan cuando este componente se
 * monta, es decir, cuando la persona elige la vista «Modelo». Nunca se cargan
 * los cinco modelos a la vez: cada ficha monta un único visor y lo libera al
 * cambiar de especie o de vista.
 *
 * La escena usa fondo azul del observatorio, sin rejilla ni suelo artificial, y
 * encuadra el modelo automáticamente a partir de su caja envolvente. La rotación
 * funciona con ratón y con tacto.
 */
export function ModelViewer({ src, label }: { src: string; label: string }) {
  const { language } = useLanguage()
  const t = marineLabels[language]
  const hostRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let cleanup: (() => void) | undefined

    const start = async () => {
      try {
        const THREE = await import('three')
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        if (disposed) return

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05
        host.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x0b1f42)

        const camera = new THREE.PerspectiveCamera(38, 4 / 3, 0.01, 1000)

        const hemi = new THREE.HemisphereLight(0xdff1ff, 0x24406b, 2.4)
        const key = new THREE.DirectionalLight(0xffffff, 2.6)
        key.position.set(1.6, 2.4, 2.2)
        const fill = new THREE.DirectionalLight(0x9fdcff, 1.3)
        fill.position.set(-2.2, 0.8, -1.4)
        const rim = new THREE.DirectionalLight(0xe8a0ff, 1)
        rim.position.set(0.4, -1.4, -2.6)
        scene.add(hemi, key, fill, rim)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = false
        controls.enablePan = false
        controls.rotateSpeed = 0.9
        controls.zoomSpeed = 0.9

        const release = (root: InstanceType<typeof THREE.Object3D>) => {
          root.traverse(object => {
            const mesh = object as InstanceType<typeof THREE.Mesh>
            mesh.geometry?.dispose()
            const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
            for (const material of materials) {
              for (const value of Object.values(material)) {
                const texture = value as InstanceType<typeof THREE.Texture>
                if (texture?.isTexture) texture.dispose()
              }
              material.dispose()
            }
          })
        }
        const turn = (event: KeyboardEvent) => {
          const turns: Record<string, [number, number]> = {
            ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15],
          }
          const step = turns[event.key]
          if (!step) return
          event.preventDefault()
          const orbit = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target))
          orbit.theta += step[0]
          orbit.phi += step[1]
          orbit.makeSafe()
          camera.position.setFromSpherical(orbit).add(controls.target)
          controls.update()
        }
        const manager = new THREE.LoadingManager()
        let observer: ResizeObserver | undefined
        cleanup = () => {
          manager.abort()
          observer?.disconnect()
          host.removeEventListener('keydown', turn)
          controls.dispose()
          release(scene)
          renderer.dispose()
          renderer.domElement.remove()
        }

        const gltf = await new GLTFLoader(manager).loadAsync(src)
        if (disposed) { release(gltf.scene); return }
        const model = gltf.scene

        // Los materiales de Tripo llegan con metalicidad 1 y sin entorno; sin
        // esta corrección el modelo se vería casi negro bajo luces directas.
        model.traverse(object => {
          const mesh = object as InstanceType<typeof THREE.Mesh>
          const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
          for (const material of materials) {
            const pbr = material as InstanceType<typeof THREE.MeshStandardMaterial>
            if (pbr.metalness !== undefined) pbr.metalness = 0.08
            if (pbr.roughness !== undefined) pbr.roughness = 0.85
            if (pbr.map) pbr.map.colorSpace = THREE.SRGBColorSpace
            material.needsUpdate = true
          }
        })
        scene.add(model)

        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        const radius = Math.max(size.x, size.y, size.z) * 0.5 || 1
        const distance = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov) / 2) * 1.15
        camera.position.set(distance * 0.32, radius * 0.22, distance)
        camera.near = distance / 120
        camera.far = distance * 140
        camera.updateProjectionMatrix()
        controls.minDistance = distance * 0.45
        controls.maxDistance = distance * 2.6
        controls.target.set(0, 0, 0)
        controls.update()

        const resize = () => {
          const width = host.clientWidth || 640
          const height = host.clientHeight || 480
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.render(scene, camera)
        }
        observer = new ResizeObserver(resize)
        observer.observe(host)
        resize()

        controls.addEventListener('change', () => renderer.render(scene, camera))
        host.addEventListener('keydown', turn)
        setState('ready')
      } catch {
        cleanup?.()
        cleanup = undefined
        if (!disposed) setState('error')
      }
    }

    start()
    return () => { disposed = true; cleanup?.(); cleanup = undefined }
  }, [src])

  return <div className="model-viewer" ref={hostRef} tabIndex={0} role="group" aria-label={label}>
    {state !== 'ready' && <p className="model-viewer-state" role={state === 'error' ? 'alert' : 'status'}>
      {state === 'error' ? t.model.error : t.model.loading}</p>}
    <p className="model-viewer-hint">{t.model.hint}</p>
  </div>
}
