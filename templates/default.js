exports.apexTemplate = (fileName, userName, currentTime) => `/**
 * @File Name          : ${fileName}
 * @Description        : 
 * @Author             : ${userName}
 * @Group              : 
 * @Last Modified By   : ${userName}
 * @Last Modified On   : ${currentTime}
 * @Modification Log   : 
 *==============================================================================
 * Ver       	   Date           Author      		   Modification
 *==============================================================================
 * 1.0       ${currentTime}    ${userName}  Initial Version
 **/
`

exports.vfTemplate = (fileName, userName, currentTime) => `<!--
  @Page Name          : ${fileName}
  @Description        : 
  @Author             : ${userName}
  @Group              : 
  @Last Modified By   : ${userName}
  @Last Modified On   : ${currentTime}
  @Modification Log   : 
  ==============================================================================
  Ver       	   Date           Author      		   Modification
  ==============================================================================
  1.0       	   ${currentTime}           ${userName}      		   Initial Version
 -->
`