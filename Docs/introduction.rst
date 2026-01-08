**What is LocaliZoom?**
------------------- 
EBRAINS LocaliZoom serial section image viewer provides an intuitive way
of navigating high-resolution 2D image series coupled with segmentation
overlay, from a web browser. At its core, it is a web-based pan-and-zoom
2D image viewer coupled with a volumetric atlas slicer, and a
navigational aid showing the entire image series as a "filmstrip".
Building on the open standard Deep Zoom Image (DZI) format, it is able
to efficiently visualise very large brain images in the gigapixel range,
allowing to zoom from common, display-sized overview resolutions down to
the microscopic resolution without downloading the underlying very large
image dataset.


.. image:: vertopal_f685c684f9f741c382a00fa63533872a/media/image7.png
   :width: 6.3in
   :height: 3.75in


In addition, LocaliZoom is available as a web app in the EBRAINS workflow LocaliView.
The LocaliView workflow is accessible with an EBRAINS account.

    https://localiview.apps.ebrains.eu/

*Key features*:
  - Visualisation of experimental histological section images with atlas overlay 
  - Display of the atlas region name when pointing the mouse at the region of interest
  - Annotations and extraction of coordinate points when enabled
  

.. image:: vertopal_f685c684f9f741c382a00fa63533872a/media/image1.png
   :width: 6.30139in
   :height: 2.75417in

Dataset DOI: https://doi.org/10.25493/G5VR-63E     

*Which atlases are supported*

**Which atlases are supported?**
-----------------------------
1. Allen Mouse Brain Atlas Common Coordinate Framework version 3 (2015 and 2017) (CCFv3) (Wang et al. 2020. Cell, https://doi.org/10.1016/j.cell.2020.04.007. Epub 2020 May 7; RRID:JCR_020999 and RRID:JRC_021000) 
2. Waxholm Atlas of the Sprague Dawley rat, version 3 and 4 (WHS rat brain atlas) (Osen et al. 2019. NeuroImage, https:doi.org/10.1016/j.neuroimage.2019.05.016; Kleven et al. Nat Methods, 2020. https://doi.org/10.1038/s41592-023-02034-3; RRID:SCR_017124)

**What is the output of LocaliZoom?**
---------------------------------

-A registration file (lz format) containing the coordinates of your annotated points in atlas space. This file is then used in the workflows automatically.








